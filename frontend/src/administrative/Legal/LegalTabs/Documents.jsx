import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Upload,
  Tag,
  Star,
  StarOff,
  MoreVertical,
  Share2,
  X,
  Save,
  Image as ImageIcon
} from "lucide-react";

export default function DocumentsTab() {
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'Contract',
    status: 'draft',
    priority: 'medium',
    tags: '',
    assignee: '',
    expiryDate: ''
  });

  const API_BASE = "http://localhost:4000";

  // Enhanced document types
  const documentTypes = [
    "Contract", "Agreement", "Policy", "Compliance", "Litigation", 
    "Memo", "Report", "Certificate", "License", "Patent", "Other"
  ];

  const documentStatuses = [
    { value: "active", label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
    { value: "draft", label: "Draft", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { value: "pending", label: "Pending Review", color: "text-blue-600", bgColor: "bg-blue-100" },
    { value: "expired", label: "Expired", color: "text-red-600", bgColor: "bg-red-100" },
    { value: "archived", label: "Archived", color: "text-gray-600", bgColor: "bg-gray-100" }
  ];

  // Fetch documents from backend
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      // Load sample data if API fails
      setDocuments(generateSampleDocuments());
    }
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === "all" || doc.type === selectedType;
      const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "date" || sortBy === "lastModified") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, selectedType, selectedStatus, sortBy, sortOrder]);

  const handleVisionAnalysis = async (file) => {
    if (!file) return;

    setVisionLoading(true);
    setVisionResult(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('mimeType', file.type);
      fd.append('fileName', file.name);

      const res = await fetch(`${API_BASE}/api/vision/analyze`, {
        method: 'POST',
        body: fd // do NOT set Content-Type; browser sets multipart boundary
      });

      const contentType = res.headers.get('content-type') || '';
      let payload;
      if (contentType.includes('application/json')) payload = await res.json();
      else payload = await res.text();

      if (!res.ok) {
        let message = 'Vision API request failed';
        if (payload) {
          if (typeof payload === 'string') message = payload;
          else if (payload.error) message = typeof payload.error === 'string' ? payload.error : (payload.error.message || JSON.stringify(payload.error));
          else if (payload.message) message = payload.message;
          else message = JSON.stringify(payload);
        }
        setVisionResult({ error: `Server ${res.status}: ${message}` });
        return;
      }

      setVisionResult(payload);
      if (payload && payload.textAnnotations && payload.textAnnotations.length > 0) {
        const extractedText = payload.textAnnotations[0].description;
        setUploadForm(prev => ({ ...prev, title: extractedText.split("\n")[0].substring(0,100) || 'Untitled Document' }));
      }
    } catch (err) {
      setVisionResult({ error: err?.message || String(err) });
    } finally {
      setVisionLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    const newDoc = {
      id: Date.now(),
      title: uploadForm.title,
      type: uploadForm.type,
      status: uploadForm.status,
      date: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      expiryDate: uploadForm.expiryDate || null,
      size: "0 KB",
      assignee: uploadForm.assignee || "Unassigned",
      priority: uploadForm.priority,
      tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()) : [],
      starred: false
    };

    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
      
      if (res.ok) {
        await fetchDocuments();
      } else {
        // Fallback to local state if API fails
        setDocuments(prev => [newDoc, ...prev]);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setDocuments(prev => [newDoc, ...prev]);
    }

    setShowUploadModal(false);
    setUploadForm({
      title: '',
      type: 'Contract',
      status: 'draft',
      priority: 'medium',
      tags: '',
      assignee: '',
      expiryDate: ''
    });
    setVisionResult(null);
  };

  const handleEditDocument = async () => {
    const updatedDoc = {
      ...editingDoc,
      lastModified: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(`${API_BASE}/api/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc)
      });
      
      if (res.ok) {
        await fetchDocuments();
      } else {
        setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
      }
    } catch (err) {
      console.error('Error updating document:', err);
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
    }

    setShowEditModal(false);
    setEditingDoc(null);
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/documents/${docId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        await fetchDocuments();
      } else {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  const toggleStarred = (docId) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const toggleDocumentSelection = (docId) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const getStatusBadge = (status) => {
    const statusInfo = documentStatuses.find(s => s.value === status) || documentStatuses[0];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    if (priority === "high") return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (priority === "medium") return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = (expiry - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Legal Documents</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedDocuments.length} documents • {selectedDocuments.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents, types, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {documentStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="lastModified-desc">Recently Modified</option>
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDocuments.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50">
                Archive
              </button>
              <button 
                onClick={() => {
                  if (confirm(`Delete ${selectedDocuments.size} documents?`)) {
                    selectedDocuments.forEach(id => handleDeleteDocument(id));
                    setSelectedDocuments(new Set());
                  }
                }}
                className="px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType !== "all" || selectedStatus !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by uploading your first document"
              }
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-4 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocuments(new Set(filteredAndSortedDocuments.map(d => d.id)));
                        } else {
                          setSelectedDocuments(new Set());
                        }
                      }}
                      checked={selectedDocuments.size === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Document
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type & Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.has(doc.id)}
                        onChange={() => toggleDocumentSelection(doc.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleStarred(doc.id)}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          {doc.starred ? <Star className="w-4 h-4 text-yellow-500 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                            {getPriorityIcon(doc.priority)}
                            {doc.expiryDate && isExpiringSoon(doc.expiryDate) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Expiring Soon
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {doc.tags?.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {doc.type}
                        </span>
                        {getStatusBadge(doc.status)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(doc.date)}</span>
                        </div>
                        {doc.expiryDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(doc.expiryDate)}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>Size: {doc.size}</div>
                        <div>Assignee: {doc.assignee}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setEditingDoc(doc);
                            setShowEditModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-yellow-600" 
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 text-gray-400 hover:text-red-600" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {documents.filter(d => d.expiryDate && isExpiringSoon(d.expiryDate)).length}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">New Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Vision AI Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="vision-upload"
                  accept="image/*"
                  onChange={(e) => handleVisionAnalysis(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="vision-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload image to extract text with Vision AI</p>
                  {visionLoading && <p className="text-sm text-blue-600 mt-2">Analyzing...</p>}
                </label>
              </div>

              {visionResult && !visionResult.error && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">✓ Text extracted successfully</p>
                </div>
              )}

              {visionResult?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{visionResult.error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={uploadForm.status}
                    onChange={(e) => setUploadForm({...uploadForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={uploadForm.priority}
                    onChange={(e) => setUploadForm({...uploadForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={uploadForm.assignee}
                    onChange={(e) => setUploadForm({...uploadForm, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm({...uploadForm, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadDocument}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Document</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingDoc.type}
                    onChange={(e) => setEditingDoc({...editingDoc, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editingDoc.status}
                    onChange={(e) => setEditingDoc({...editingDoc, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {documentStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingDoc.priority}
                    onChange={(e) => setEditingDoc({...editingDoc, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={editingDoc.assignee}
                    onChange={(e) => setEditingDoc({...editingDoc, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingDoc.tags.join(', ')}
                  onChange={(e) => setEditingDoc({...editingDoc, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={editingDoc.expiryDate}
                  onChange={(e) => setEditingDoc({...editingDoc, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDocument}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}