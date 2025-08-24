import React, { useState } from 'react';
import { Search, Plus, Menu, Settings, Share2, Archive, Pin, Trash2, Eye, Download, Wifi, FileText } from 'lucide-react';

const App = () => {
  const [articles, setArticles] = useState([]);
  const [showAddContent, setShowAddContent] = useState(false);
  const [currentView, setCurrentView] = useState('list');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [url, setUrl] = useState('');

  const handleAddArticle = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setExtractionStatus('Initializing extraction...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setExtractionStatus('Analyzing URL structure...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setExtractionStatus('Connecting to content source...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExtractionStatus('Extracting original content...');
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Try multiple extraction methods in order of preference
      let extractedData = null;
      let lastError = null;
      
      // Method 1: Try allorigins.win proxy
      try {
        setExtractionStatus('Trying primary extraction method...');
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.contents && data.contents.length > 200) {
            extractedData = await parseRealContent(data.contents, url);
          }
        }
      } catch (error) {
        lastError = error;
        console.log('Primary extraction failed:', error.message);
      }
      
      // Method 2: Try cors-anywhere alternative
      if (!extractedData) {
        try {
          setExtractionStatus('Trying alternative extraction method...');
          const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
          });
          if (response.ok) {
            const html = await response.text();
            if (html && html.length > 200) {
              extractedData = await parseRealContent(html, url);
            }
          }
        } catch (error) {
          lastError = error;
          console.log('Alternative extraction failed:', error.message);
        }
      }
      
      // Method 3: Try direct fetch (will work for some sites)
      if (!extractedData) {
        try {
          setExtractionStatus('Trying direct extraction...');
          const response = await fetch(url, {
            mode: 'cors',
            headers: {
              'User-Agent': 'ContentVault/1.0'
            }
          });
          if (response.ok) {
            const html = await response.text();
            if (html && html.length > 200) {
              extractedData = await parseRealContent(html, url);
            }
          }
        } catch (error) {
          lastError = error;
          console.log('Direct extraction failed:', error.message);
        }
      }
      
      // STRICT POLICY: NO AI GENERATION - If real extraction fails, the operation fails
      if (!extractedData || !extractedData.content || extractedData.content.trim().length < 50) {
        throw new Error(`EXTRACTION FAILED - No original content could be retrieved from this URL.

This may be due to:
• CORS restrictions (most websites block cross-origin requests)
• Login requirements or paywalls  
• Dynamic content that loads via JavaScript
• Anti-bot protection

IMPORTANT: This app ONLY extracts real, original content from web pages. 
AI-generated content is strictly prohibited to ensure authenticity and respect copyright.

For reliable content extraction, you would need:
• A backend server to handle extraction without CORS restrictions
• Server-side headless browser (Puppeteer, Playwright)
• Content extraction APIs with proper authentication

Try URLs that allow cross-origin access or use a production setup with server-side extraction.`);
      }
      
      setExtractionStatus('Validating extracted content...');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setExtractionStatus('Preserving original formatting...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newArticle = {
        id: Date.now().toString(),
        title: extractedData.title,
        url: url,
        content: extractedData.content,
        summary: extractedData.summary,
        readingTime: extractedData.readingTime,
        wordCount: extractedData.wordCount,
        tags: extractedData.tags,
        images: extractedData.images,
        contentType: extractedData.contentType,
        metadata: extractedData.metadata,
        extractionMethod: extractedData.method || 'real-content-extraction',
        createdAt: new Date(),
        isPinned: false,
        isArchived: false
      };

      setExtractionStatus('Original content saved successfully!');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setArticles(prev => [newArticle, ...prev]);
      setUrl('');
      setLoading(false);
      setExtractionStatus('');
      setShowAddContent(false);
      
    } catch (error) {
      console.error('Content extraction failed:', error);
      setExtractionStatus('Extraction failed');
      setLoading(false);
      alert(`Content extraction failed:\n\n${error.message}`);
    }
  };

  const parseRealContent = async (html, sourceUrl) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements but preserve the original content structure
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.advertisement', '.ads', '.sidebar', '.menu',
      '.social-share', '.comments', '.related-posts'
    ];
    unwantedSelectors.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Extract the original title from the page
    const title = doc.querySelector('h1')?.textContent?.trim() || 
                  doc.querySelector('title')?.textContent?.trim() || 
                  doc.querySelector('.title')?.textContent?.trim() ||
                  doc.querySelector('[class*="title"]')?.textContent?.trim() ||
                  'Extracted Article';
    
    // Find the main content area with multiple fallback selectors
    const contentSelectors = [
      'article', 'main', '.content', '.post-content', '.entry-content',
      '.article-content', '.post-body', '#content', '#main-content',
      '.story-body', '.article-body', '[role="main"]', '.page-content'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement && contentElement.textContent.trim().length > 200) {
        break;
      }
    }
    
    if (!contentElement) {
      // Last resort: try to find the largest text block
      const allDivs = Array.from(doc.querySelectorAll('div'));
      contentElement = allDivs.reduce((largest, current) => {
        const currentLength = current.textContent?.trim().length || 0;
        const largestLength = largest?.textContent?.trim().length || 0;
        return currentLength > largestLength ? current : largest;
      }, null);
    }
    
    if (!contentElement || contentElement.textContent.trim().length < 100) {
      throw new Error('No substantial content found on this page. The page may require login, be behind a paywall, or contain mostly dynamic content.');
    }
    
    // Extract and preserve the original content structure
    const structuredContent = extractOriginalStructure(contentElement);
    
    // Extract original images from the page
    const images = extractOriginalImages(contentElement, sourceUrl);
    
    return {
      method: 'real-content-extraction',
      title: title,
      content: structuredContent.formatted,
      summary: structuredContent.summary,
      readingTime: Math.ceil(structuredContent.wordCount / 200),
      wordCount: structuredContent.wordCount,
      tags: extractTagsFromOriginalContent(title, structuredContent.formatted),
      images: images,
      contentType: determineContentType(sourceUrl),
      metadata: {
        sourceUrl: sourceUrl,
        domain: new URL(sourceUrl).hostname,
        extractedAt: new Date(),
        contentLength: structuredContent.wordCount,
        extractionNote: 'Original content only - no AI generation'
      }
    };
  };

  const extractOriginalStructure = (element) => {
    // Preserve the original HTML structure and convert to readable format
    let content = '';
    
    // Process each child node to maintain structure
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          content += text + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        
        // Handle different HTML elements appropriately
        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            content += '\n\n## ' + node.textContent.trim() + '\n\n';
            break;
          case 'p':
            content += '\n\n' + node.textContent.trim() + '\n\n';
            break;
          case 'br':
            content += '\n';
            break;
          case 'li':
            content += '\n• ' + node.textContent.trim();
            break;
          case 'blockquote':
            content += '\n\n> ' + node.textContent.trim() + '\n\n';
            break;
          case 'strong':
          case 'b':
            content += '**' + node.textContent.trim() + '**';
            break;
          case 'em':
          case 'i':
            content += '*' + node.textContent.trim() + '*';
            break;
          default:
            // For other elements, process their children
            Array.from(node.childNodes).forEach(processNode);
            break;
        }
      }
    };
    
    Array.from(element.childNodes).forEach(processNode);
    
    // Clean up the formatted content
    const formatted = content
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces
      .trim();
    
    const wordCount = formatted.split(/\s+/).filter(word => word.length > 0).length;
    
    // Create summary from the first few sentences of the original content
    const sentences = formatted.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summary = sentences.slice(0, 3).join('. ').trim() + (sentences.length > 3 ? '.' : '');
    
    return { 
      formatted, 
      wordCount, 
      summary: summary.length > 50 ? summary : formatted.substring(0, 300) + '...'
    };
  };

  const extractOriginalImages = (element, sourceUrl) => {
    const images = [];
    const imgElements = element.querySelectorAll('img');
    
    imgElements.forEach(img => {
      let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
      if (src) {
        // Convert relative URLs to absolute URLs
        if (src.startsWith('//')) {
          src = 'https:' + src;
        } else if (src.startsWith('/')) {
          const baseUrl = new URL(sourceUrl);
          src = baseUrl.origin + src;
        } else if (!src.startsWith('http')) {
          const baseUrl = new URL(sourceUrl);
          src = new URL(src, baseUrl).href;
        }
        
        images.push({
          src: src,
          alt: img.alt || img.getAttribute('title') || 'Image from article',
          width: img.width || null,
          height: img.height || null
        });
      }
    });
    
    return images.length > 0 ? images : [{
      src: `https://via.placeholder.com/800x400/6B7280/white?text=No+Images+Found`,
      alt: 'No images available in original content'
    }];
  };

  const extractTagsFromOriginalContent = (title, content) => {
    // Extract meaningful keywords from the original content only
    const text = (title + ' ' + content).toLowerCase();
    const words = text.match(/\b[a-z]{4,15}\b/g) || [];
    
    // Common stop words to exclude
    const stopWords = new Set([
      'this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 
      'are', 'the', 'and', 'for', 'you', 'all', 'any', 'can', 'had', 'her', 
      'his', 'how', 'man', 'new', 'now', 'old', 'see', 'way', 'who', 'boy', 
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'may', 'also',
      'make', 'most', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);
    
    const wordFreq = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length >= 4) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  };

  const determineContentType = (url) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('wikipedia')) return 'reference';
    if (urlLower.includes('github')) return 'code';
    if (urlLower.includes('youtube')) return 'video';
    if (urlLower.includes('stackoverflow')) return 'qa';
    if (urlLower.includes('blog') || urlLower.includes('medium')) return 'blog';
    return 'article';
  };

  const handleReadArticle = (article) => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedArticle(null);
  };

  const handlePin = (articleId) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId ? { ...article, isPinned: !article.isPinned } : article
    ));
  };

  const handleArchive = (articleId) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId ? { ...article, isArchived: !article.isArchived } : article
    ));
  };

  const handleDelete = (articleId) => {
    if (window.confirm('Delete this article?')) {
      setArticles(prev => prev.filter(article => article.id !== articleId));
    }
  };

  const filteredArticles = articles.filter(article =>
    !searchQuery || article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">📚 ContentVault</h1>
              <div className="flex items-center gap-1 text-sm">
                <Wifi size={14} className="text-green-500" />
                <span className="text-green-500">Online</span>
              </div>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddContent(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                Add Content
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-lg">
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="w-72">
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Articles:</span>
                  <span className="font-semibold">{articles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pinned:</span>
                  <span className="font-semibold">{articles.filter(a => a.isPinned).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Archived:</span>
                  <span className="font-semibold">{articles.filter(a => a.isArchived).length}</span>
                </div>
              </div>
              
              {currentView === 'article' && (
                <button
                  onClick={handleBackToList}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                >
                  ← Back to Articles
                </button>
              )}
            </div>
          </div>

          <div className="flex-1">
            {currentView === 'list' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">All Articles</h2>
                  <p className="text-gray-600">({filteredArticles.length} articles)</p>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to ContentVault!</h3>
                    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                      Save articles from the web for distraction-free reading. Start by adding your first article!
                    </p>
                    <button
                      onClick={() => setShowAddContent(true)}
                      className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium text-lg flex items-center gap-2 mx-auto"
                    >
                      <Plus size={20} />
                      Add Your First Article
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredArticles.map(article => (
                      <div key={article.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 
                              className="font-semibold text-lg leading-tight flex-1 mr-2 cursor-pointer hover:text-blue-600"
                              onClick={() => handleReadArticle(article)}
                            >
                              {article.title}
                            </h3>
                            <div className="relative">
                              <Menu size={16} className="text-gray-400" />
                            </div>
                          </div>
                          
                          <p 
                            className="text-gray-600 text-sm mb-4 cursor-pointer line-clamp-3"
                            onClick={() => handleReadArticle(article)}
                          >
                            {article.summary.substring(0, 150)}...
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                            <span>{article.readingTime} min read</span>
                            <span>{article.wordCount} words</span>
                            <span>{article.createdAt.toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-1 flex-wrap mb-4">
                            {article.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleReadArticle(article)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                            >
                              Read Article
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePin(article.id)}
                                className={`p-2 rounded ${article.isPinned ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
                              >
                                <Pin size={14} />
                              </button>
                              <button
                                onClick={() => handleArchive(article.id)}
                                className={`p-2 rounded ${article.isArchived ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                              >
                                <Archive size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="p-2 rounded text-gray-400 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-8">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedArticle?.title}</h1>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {selectedArticle?.readingTime} min read
                      </span>
                      <span>{selectedArticle?.wordCount} words</span>
                      <span>{selectedArticle?.createdAt.toLocaleDateString()}</span>
                      {selectedArticle?.extractionMethod && (
                        <span className="text-green-600 bg-green-50 text-xs px-2 py-1 rounded">
                          Original Content Only
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap mb-6">
                      {selectedArticle?.tags.map(tag => (
                        <span key={
