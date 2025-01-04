import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setNews } from '../store/newsSlice';
import { saveAs } from 'file-saver'; // For exporting CSV

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ author: '', dateRange: '' });
  const [payoutRate, setPayoutRate] = useState(10); // Default payout rate
  const dispatch = useDispatch();
  const news = useSelector((state) => state.news.items);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=${searchTerm}&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
        );

        if (response.status === 200) {
          dispatch(setNews(response.data.articles));
        } else {
          console.error('Unexpected response:', response);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        if (error.response && error.response.data) {
          console.error('API Error:', error.response.data);
        }
      }
    };

    fetchNews();
  }, [dispatch, searchTerm]);

  const handleExport = (exportType) => {
    if (exportType === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," + news.map(article => 
        `${article.title},${article.author || 'Unknown'},${new Date(article.publishedAt).toLocaleDateString()}`
      ).join("\n");

      const encodedUri = encodeURI(csvContent);
      saveAs(encodedUri, "news_articles.csv");
    } else if (exportType === 'pdf') {
      // You can use a library like jsPDF to export the data to PDF.
      console.log("Exporting to PDF...");
    } else {
      console.log("Unsupported export type:", exportType);
    }
  };

  const calculatePayout = () => {
    return news.length * payoutRate;
  };

  // Filter news based on filters
  const filteredNews = news.filter((article) => {
    // Filter by searchTerm
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by author
    if (filters.author && article.author !== filters.author) {
      return false;
    }

    // Filter by dateRange
    if (filters.dateRange && new Date(article.publishedAt) < new Date(filters.dateRange)) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>

      <div className="filters mb-4 space-y-4 sm:space-y-0 sm:flex sm:space-x-4 sm:flex-wrap">
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-options flex space-x-4 mt-4 sm:mt-0">
          <select
            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
            className="border p-2 rounded w-full sm:w-1/3"
          >
            <option value="">Filter by Author</option>
            {/* Populate authors dynamically */}
          </select>

          <input
            type="date"
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="border p-2 rounded w-full sm:w-1/3"
          />
        </div>
      </div>

      <div className="news-list mb-4 space-y-4">
        {filteredNews.map((article, index) => (
          <div key={index} className="border p-4 mb-2 rounded bg-gray-100">
            <h2 className="font-bold text-lg">{article.title}</h2>
            <p>Author: {article.author || 'Unknown'}</p>
            <p>Date: {new Date(article.publishedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="payout-section mb-4">
        <label className="block mb-2">Payout per Article:</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={payoutRate}
          onChange={(e) => setPayoutRate(Number(e.target.value))}
        />

        <p className="mt-2">Total Payout: ${calculatePayout()}</p>
      </div>

      <div className="export-buttons space-x-4">
        <button
          onClick={() => handleExport('pdf')}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Export to PDF
        </button>
        <button
          onClick={() => handleExport('csv')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Export to CSV
        </button>
      </div>
    </div>
  );
};

export default Home;
