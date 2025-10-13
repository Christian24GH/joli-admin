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
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Upload,
  FileText,
  Shield,
  AlertCircle,
  Target,
  BookOpen,
  Users,
  Building,
  MoreVertical,
  Bell,
  Star,
  StarOff,
  Activity,
  TrendingUp,
  Award,
  Flag,
  Zap,
  ExternalLink,
  MessageSquare,
  Settings
} from "lucide-react";

export default function ComplianceTab() {
  const [compliance, setCompliance] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [sortBy, setSortBy] = useState("due");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingItem, setEditingItem] = useState(null);
  
  // Enhanced form state
  const [enhancedForm, setEnhancedForm] = useState({
    title: "",
    due: "",
    description: "",
    category: "Regulatory",
    status: "pending",
    priority: "medium",
    riskLevel: "medium",
    assignee: "",
    department: "",
    framework: "",
    evidence: "",
    nextReview: "",
  });

  const complianceCategories = [
    "Regulatory", "Data Protection", "Financial", "Health & Safety", 
    "Environmental", "Quality", "Security", "HR & Employment", "Other"
  ];

  const complianceStatuses = [
    { value: "pending", label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
    { value: "in_progress", label: "In Progress", color: "text-blue-600", bgColor: "bg-blue-100", icon: Activity },
    { value: "completed", label: "Completed", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
    { value: "overdue", label: "Overdue", color: "text-red-600", bgColor: "bg-red-100", icon: AlertTriangle },
    { value: "exempt", label: "Exempt", color: "text-gray-600", bgColor: "bg-gray-100", icon: Shield },
    { value: "under_review", label: "Under Review", color: "text-purple-600", bgColor: "bg-purple-100", icon: Eye }
  ];

  const riskLevels = [
    { value: "low", label: "Low Risk", color: "text-green-600", bgColor: "bg-green-50" },
    { value: "medium", label: "Medium Risk", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    { value: "high", label: "High Risk", color: "text-orange-600", bgColor: "bg-orange-50" },
    { value: "critical", label: "Critical Risk", color: "text-red-600", bgColor: "bg-red-50" }
  ];

  const priorityLevels = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "critical", label: "Critical", color: "text-red-600" }
  ];

  // Fetch compliance data from backend
  useEffect(() => {
    fetchCompliance();
  }, []);

  async function fetchCompliance() {
    try {
      const res = await fetch("http://localhost:4000/compliance");
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (err) {
        console.warn("Invalid JSON from /compliance:", text);
        data = null;
      }

      console.log("Fetched raw compliance response:", data);

      // Normalize response into an array of items
      let complianceData = [];
      if (Array.isArray(data)) {
        complianceData = data;
      } else if (data && Array.isArray(data.compliance)) {
        complianceData = data.compliance;
      } else if (data && Array.isArray(data.data)) {
        complianceData = data.data;
      } else if (data && data.compliance && typeof data.compliance === "object") {
        // single item returned as object
        complianceData = [data.compliance];
      } else if (data && typeof data === "object" && Object.keys(data).length > 0) {
        // fallback: maybe top-level object with fields that look like an item
        // Heuristic: if it has an id/title, treat as single item
        if (data.id || data.title) complianceData = [data];
      }

      console.log("Normalized complianceData:", complianceData);
      setCompliance(complianceData);
    } catch (err) {
      console.error("Error fetching compliance:", err);
      setCompliance([]);
    }
  }

  // Add / Update compliance item to backend
  async function addCompliance(e) {
    e.preventDefault();
    try {
      console.log(editingItem ? "Updating item" : "Creating item", editingItem, enhancedForm);

      const url = editingItem ? `http://localhost:4000/compliance/${editingItem.id}` : "http://localhost:4000/compliance";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enhancedForm),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        console.error(`${method} /compliance failed`, res.status, payload);
        return;
      }

      // Refresh authoritative list so data persists across refresh
      await fetchCompliance();

      // reset form + editing state
      setEnhancedForm({
        title: "",
        due: "",
        description: "",
        category: "Regulatory",
        status: "pending",
        priority: "medium",
        riskLevel: "medium",
        assignee: "",
        department: "",
        framework: "",
        evidence: "",
        nextReview: ""
      });
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Error adding/updating compliance:", err);
    }
  }

  // Delete compliance item
  async function deleteCompliance(id) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:4000/compliance/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("Delete failed", res.status, txt);
        return;
      }
      await fetchCompliance();
    } catch (err) {
      console.error("Error deleting compliance:", err);
    }
  }

  // Sample enhanced compliance data
  const enhancedCompliance = useMemo(() => {
    return compliance.map(item => ({
      ...item,
      category: item.category || "Regulatory",
      status: item.status || "pending",
      priority: item.priority || "medium",
      riskLevel: item.riskLevel || "medium",
      assignee: item.assignee || "Unassigned",
      department: item.department || "Legal",
      framework: item.framework || "",
      evidence: item.evidence || "",
      nextReview: item.nextReview || "",
      starred: item.starred || false,
      progress: item.progress || 0
    }));
  }, [compliance]);

  // Filter and sort compliance items
  const filteredAndSortedCompliance = useMemo(() => {
    let filtered = enhancedCompliance.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.framework?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchesRisk = selectedRisk === "all" || item.riskLevel === selectedRisk;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesRisk;
    });

    // Sort compliance items
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "due" || sortBy === "nextReview" || sortBy === "lastUpdate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedCompliance, searchTerm, selectedStatus, selectedCategory, selectedRisk, sortBy, sortOrder]);

  const getStatusInfo = (status) => {
    return complianceStatuses.find(s => s.value === status) || complianceStatuses[0];
  };

  const getRiskInfo = (riskLevel) => {
    return riskLevels.find(r => r.value === riskLevel) || riskLevels[1];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // safer days-until-due helper
  function getDaysUntilDue(dueDate) {
    if (!dueDate) return Infinity;
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return Infinity;
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate statistics
  const totalItems = enhancedCompliance.length;
  const completedItems = enhancedCompliance.filter(c => c.status === 'completed').length;
  const overdueItems = enhancedCompliance.filter(c => c.status === 'overdue').length;
  const highRiskItems = enhancedCompliance.filter(c => c.riskLevel === 'high' || c.riskLevel === 'critical').length;
  const completionRate = totalItems > 0 ? ((completedItems / totalItems) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Compliance Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedCompliance.length} items • {selectedItems.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setEnhancedForm({
                title: "",
                due: "",
                description: "",
                category: "Regulatory",
                status: "pending",
                priority: "medium",
                riskLevel: "medium",
                assignee: "",
                department: "",
                framework: "",
                evidence: "",
                nextReview: ""
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedItems}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueItems}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-orange-600">{highRiskItems}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search compliance items, frameworks, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {complianceStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {complianceCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              {riskLevels.map(risk => (
                <option key={risk.value} value={risk.value}>{risk.label}</option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="due-asc">Due Date (Earliest)</option>
              <option value="due-desc">Due Date (Latest)</option>
              <option value="priority-desc">Priority (Highest)</option>
              <option value="riskLevel-desc">Risk Level (Highest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Compliance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Compliance Item" : "Add New Compliance Item"}
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={addCompliance} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={enhancedForm.title || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={enhancedForm.category || "Regulatory"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {complianceCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={enhancedForm.due || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, due: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={enhancedForm.status || "pending"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {complianceStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={enhancedForm.priority || "medium"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level *</label>
                  <select
                    value={enhancedForm.riskLevel || "medium"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, riskLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {riskLevels.map(risk => (
                      <option key={risk.value} value={risk.value}>{risk.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={enhancedForm.assignee || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, assignee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Person responsible"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={enhancedForm.department || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Responsible department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Framework/Standard</label>
                  <input
                    type="text"
                    value={enhancedForm.framework || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, framework: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., ISO 27001, GDPR Article 35"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={enhancedForm.description || ""}
                  onChange={(e) => setEnhancedForm(f => ({ ...f, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Detailed description of compliance requirement..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence/Documentation</label>
                <textarea
                  value={enhancedForm.evidence || ""}
                  onChange={(e) => setEnhancedForm(f => ({ ...f, evidence: e.target.value }))}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Required evidence and documentation..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compliance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAndSortedCompliance.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance items found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== "all" || selectedCategory !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by adding your first compliance item"
              }
            </p>
            <button 
              onClick={() => {
                setEditingItem(null);
                setEnhancedForm({
                  title: "",
                  due: "",
                  description: "",
                  category: "Regulatory",
                  status: "pending",
                  priority: "medium",
                  riskLevel: "medium",
                  assignee: "",
                  department: "",
                  framework: "",
                  evidence: "",
                  nextReview: ""
                });
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Compliance Item
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
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compliance Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category & Risk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedCompliance.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  const riskInfo = getRiskInfo(item.riskLevel);
                  const daysUntilDue = getDaysUntilDue(item.due);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-start space-x-3">
                          <button 
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                            onClick={() => console.log(`Toggle star for ${item.id}`)}
                          >
                            {item.starred ? 
                              <Star className="w-4 h-4 text-yellow-500 fill-current" /> : 
                              <StarOff className="w-4 h-4" />
                            }
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{item.title}</span>
                              <span className={`text-xs ${priorityLevels.find(p => p.value === item.priority)?.color || 'text-gray-600'}`}>
                                {priorityLevels.find(p => p.value === item.priority)?.label || 'Medium'}
                              </span>
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {item.description}
                              </div>
                            )}
                            {item.framework && (
                              <div className="flex items-center gap-1 mt-1">
                                <BookOpen className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{item.framework}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.category}
                          </span>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${riskInfo.color} ${riskInfo.bgColor}`}>
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {riskInfo.label}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900">Due: {formatDate(item.due)}</span>
                          </div>
                          {daysUntilDue >= 0 ? (
                            <div className={`text-xs ${daysUntilDue <= 7 ? 'text-red-600' : daysUntilDue <= 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {daysUntilDue === 0 ? "Due today" : 
                               daysUntilDue === 1 ? "Due tomorrow" :
                               `${daysUntilDue} days left`}
                            </div>
                          ) : (
                            <div className="text-xs text-red-600 font-medium">
                              Overdue by {Math.abs(daysUntilDue)} days
                            </div>
                          )}
                          {item.nextReview && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Review: {formatDate(item.nextReview)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-900">{item.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{item.department}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          {item.progress !== undefined && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Progress</span>
                                <span className="text-gray-900 font-medium">{item.progress}%</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    item.progress === 100 ? 'bg-green-500' :
                                    item.progress >= 75 ? 'bg-blue-500' :
                                    item.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {(daysUntilDue <= 7 && daysUntilDue >= 0) && (
                            <div className="flex items-center gap-1">
                              <Bell className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-orange-600 font-medium">Urgent</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingItem(item);
                              setEnhancedForm({...item});
                              setShowForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors" 
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors" 
                            title="Download evidence"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors" 
                            title="Add comment"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button 
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors" 
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {overdueItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  {overdueItems} overdue compliance item{overdueItems !== 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-red-600 mt-1">
                  Immediate action required to maintain compliance
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors">
                View All
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Send Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
          <div className="space-y-3">
            {riskLevels.map(risk => {
              const count = enhancedCompliance.filter(c => c.riskLevel === risk.value).length;
              const percentage = totalItems > 0 ? (count / totalItems * 100).toFixed(1) : 0;
              return (
                <div key={risk.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      risk.value === 'critical' ? 'bg-red-500' :
                      risk.value === 'high' ? 'bg-orange-500' :
                      risk.value === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-sm text-gray-600">{risk.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          risk.value === 'critical' ? 'bg-red-500' :
                          risk.value === 'high' ? 'bg-orange-500' :
                          risk.value === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Compliance Report</div>
                <div className="text-xs text-gray-500">Generate comprehensive compliance status report</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Configure Alerts</div>
                <div className="text-xs text-gray-500">Set up automated compliance notifications</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Risk Matrix</div>
                <div className="text-xs text-gray-500">View compliance risk assessment matrix</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Audit Trail</div>
                <div className="text-xs text-gray-500">Review compliance activity and changes</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Category Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complianceCategories.slice(0, 6).map(category => {
            const categoryItems = enhancedCompliance.filter(c => c.category === category);
            const completed = categoryItems.filter(c => c.status === 'completed').length;
            const completionRate = categoryItems.length > 0 ? (completed / categoryItems.length * 100).toFixed(0) : 0;
            
            return (
              <div key={category} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{category}</h4>
                  <span className="text-xs text-gray-500">{categoryItems.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{completionRate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}