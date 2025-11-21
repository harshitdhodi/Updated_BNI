import React, { useState, useEffect } from 'react';
import { Mail, Phone, Globe, Calendar, User, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function UserMyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const { id: userId } = useParams();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Calculate pageCount
  useEffect(() => {
    if (totalItems > 0) {
      setPageCount(Math.ceil(totalItems / pageSize));
    } else {
      setPageCount(1);
    }
  }, [totalItems, pageSize]);

  // Reset pageIndex if exceeds pageCount
  useEffect(() => {
    if (totalItems > 0 && pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex, totalItems]);

  useEffect(() => {
    fetchMatches();
  }, [pageIndex, pageSize]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");
      const response = await fetch(
        `/api/match2/forAdminAllMatches?userId=${userId}&page=${pageIndex + 1}&limit=${pageSize}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const result = await response.json();
      setMatches(result.data || []);
      setTotalItems(result.total || 0);
      if (result.totalPages) {
        setPageCount(result.totalPages);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  const goToPage = (page) => setPageIndex(page - 1);
  const goToFirstPage = () => setPageIndex(0);
  const goToLastPage = () => setPageIndex(pageCount - 1);

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pageCount;
    const current = pageIndex + 1;
    const delta = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (current <= delta + 2) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (current >= totalPages - delta - 1) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - delta; i <= current + delta; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;
  const currentPage = pageIndex + 1;
  const startingRowNumber = pageIndex * pageSize;

  if (loading && matches.length === 0) {
    return (
      <div className="min-h-screen sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen sm:p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Matches</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={fetchMatches}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Matches</h1>
            <p className="text-gray-600">
              Companies you've connected with {totalItems > 0 && `(${totalItems} total)`}
            </p>
          </div>
          {matches.length > 0 && (
            <button
              onClick={fetchMatches}
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Loading overlay */}
        {loading && matches.length > 0 && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
            <p className="text-gray-500">Your matched companies will appear here</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div key={match._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="flex flex-col lg:flex-row">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-[#eef5ff] to-[#dbeafe] p-6 lg:w-64 flex-shrink-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {startingRowNumber + index + 1}
                          </div>
                          <h2 className="text-2xl font-bold text-black">{match.companyName}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-black/80 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>Added {formatDate(match.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {/* Company Info */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Company Info</h3>

                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <a href={`mailto:${match.email}`} className="text-sm text-gray-700 hover:text-indigo-600 break-all">
                                {match.email}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <a href={`tel:${match.phoneNumber}`} className="text-sm text-gray-700 hover:text-green-600">
                                {match.phoneNumber}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Globe className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Website</p>
                              <a
                                href={`https://${match.webURL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-gray-700 hover:text-blue-600 break-all"
                              >
                                {match.webURL}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Contact Person */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Contact Person</h3>

                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Name</p>
                              <p className="text-sm font-semibold text-gray-800">{match.user?.name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Email</p>
                              <a href={`mailto:${match.user?.email}`} className="text-sm text-gray-700 hover:text-indigo-600 break-all">
                                {match.user?.email}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-1">Mobile</p>
                              <a href={`tel:${match.user?.mobile}`} className="text-sm text-gray-700 hover:text-green-600">
                                {match.user?.mobile}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-white rounded-lg shadow-md">
              {/* Rows per page */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="hidden sm:inline">entries</span>
              </div>

              {/* Page info */}
              <span className="text-sm text-gray-600">
                {totalItems === 0
                  ? "No entries"
                  : `Showing ${startingRowNumber + 1} to ${Math.min((pageIndex + 1) * pageSize, totalItems)} of ${totalItems}`}
              </span>

              {/* Pagination Controls */}
              <nav className="flex items-center gap-1 flex-wrap justify-center" aria-label="Pagination">
                <button
                  onClick={goToFirstPage}
                  disabled={isFirstPage}
                  className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  First
                </button>
                <button
                  onClick={handlePreviousPage}
                  disabled={isFirstPage}
                  className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Prev
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page ? "bg-indigo-600 text-white shadow-md" : "bg-white hover:bg-indigo-50 text-gray-700 border border-gray-300"}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Mobile: Show current page */}
                <span className="sm:hidden px-3 py-2 text-sm text-gray-600">
                  {currentPage} / {pageCount}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={isLastPage}
                  className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Next
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={isLastPage}
                  className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Last
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}