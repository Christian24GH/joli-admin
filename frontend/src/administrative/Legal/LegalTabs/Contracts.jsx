import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, Filter, Download, Eye, Edit3, Trash2, Plus, Calendar, DollarSign,
  AlertTriangle, CheckCircle, Clock, X, Upload, FileText, Users, Building,
  Percent, TrendingUp, TrendingDown, MoreVertical, Bell, Star, StarOff, Copy, Send
} from "lucide-react";

export default function ContractsTab() {
  // runtime-safe API base (works in dev and static builds)
  const API_BASE =
    (typeof window !== "undefined" && window.__API_BASE__) ||
    (typeof import.meta !== "undefined" && import.meta.env && (import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL)) ||
    "http://localhost:4000";

  const [contracts, setContracts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [valueRange, setValueRange] = useState("all");
  const [sortBy, setSortBy] = useState("due");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState(new Set());
  const [editingContract, setEditingContract] = useState(null);

  // Enhanced form state
  const [enhancedForm, setEnhancedForm] = useState({
    title: "",
    value: "",
    due: "",
    startDate: "",
    type: "Service Agreement",
    status: "draft",
    client: "",
    description: "",
    priority: "medium",
    renewalTerms: "",
    paymentTerms: ""
  });

  // Fetch contracts from backend
  async function fetchContracts() {
    try {
      const res = await fetch(`${API_BASE}/contracts`);
      if (!res.ok) throw new Error(`Failed to fetch contracts: ${res.status}`);
      const data = await res.json();
      // backend might return an array or an object like { contracts: [...] }
      const list = Array.isArray(data) ? data : (data.contracts || data);
      setContracts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("fetchContracts error:", err);
      setContracts([]);
    }
  }

  useEffect(() => {
    fetchContracts();
  }, []);

  // Add or update contract to backend
  async function addContract(e) {
    e.preventDefault();
    try {
      const payload = {
        title: enhancedForm.title,
        value: enhancedForm.value,
        due: enhancedForm.due,
        startDate: enhancedForm.startDate,
        type: enhancedForm.type,
        status: enhancedForm.status,
        client: enhancedForm.client,
        description: enhancedForm.description,
        priority: enhancedForm.priority,
        renewalTerms: enhancedForm.renewalTerms,
        paymentTerms: enhancedForm.paymentTerms
      };

      let res, result;
      if (editingContract && editingContract.id) {
        res = await fetch(`${API_BASE}/contracts/${editingContract.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      } else {
        res = await fetch(`${API_BASE}/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      }

      if (!res.ok) {
        console.error("Create/Update contract failed:", result);
      }

      // Refresh list to reflect DB state
      await fetchContracts();

      // reset form
      setEnhancedForm({
        title: "",
        value: "",
        due: "",
        startDate: "",
        type: "Service Agreement",
        status: "draft",
        client: "",
        description: "",
        priority: "medium",
        renewalTerms: "",
        paymentTerms: ""
      });
      setShowForm(false);
      setEditingContract(null);
    } catch (err) {
      console.error("addContract error:", err);
    }
  }

  // Delete contract
  async function deleteContract(id) {
    if (!confirm("Delete this contract?")) return;
    try {
      const res = await fetch(`${API_BASE}/contracts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.text();
        console.error("Delete failed:", res.status, body);
      }
      await fetchContracts();
      setSelectedContracts(prev => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    } catch (err) {
      console.error("deleteContract error:", err);
    }
  }

  // Toggle starred (example update)
  async function toggleStar(contract) {
    try {
      const updated = { ...contract, starred: !contract.starred };
      const res = await fetch(`${API_BASE}/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: updated.starred }),
      });
      if (!res.ok) console.error("Failed toggle star", await res.text());
      await fetchContracts();
    } catch (err) {
      console.error("toggleStar error:", err);
    }
  }

  // Selection helpers
  function toggleSelect(id) {
    setSelectedContracts(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  }

  function selectAllVisible() {
    const ids = filteredAndSortedContracts.map(c => c.id);
    setSelectedContracts(new Set(ids));
  }

  function clearSelection() {
    setSelectedContracts(new Set());
  }

  const contractTypes = [
    "Service Agreement", "Employment", "Partnership", "License", 
    "Non-Disclosure", "Vendor", "Lease", "Consulting", "Other"
  ];

  const contractStatuses = [
    { value: "draft", label: "Draft", color: "text-gray-600", bgColor: "bg-gray-100", icon: Edit3 },
    { value: "pending", label: "Pending Review", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
    { value: "active", label: "Active", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
    { value: "expiring", label: "Expiring Soon", color: "text-orange-600", bgColor: "bg-orange-100", icon: AlertTriangle },
    { value: "expired", label: "Expired", color: "text-red-600", bgColor: "bg-red-100", icon: X },
    { value: "terminated", label: "Terminated", color: "text-red-800", bgColor: "bg-red-200", icon: X }
  ];

  const priorityLevels = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-red-600" }
  ];

  // Enhanced contracts for display
  const enhancedContracts = useMemo(() => {
    return contracts.map(contract => ({
      ...contract,
      type: contract.type || "Service Agreement",
      status: contract.status || "active",
      client: contract.client || "Unknown Client",
      priority: contract.priority || "medium",
      startDate: contract.startDate || contract.due,
      description: contract.description || "",
      renewalTerms: contract.renewalTerms || "",
      paymentTerms: contract.paymentTerms || "Net 30",
      starred: !!contract.starred,
      value: contract.value || 0
    }));
  }, [contracts]);

  // Filter and sort contracts
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = enhancedContracts.filter(contract => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || contract.title.toLowerCase().includes(s) ||
                           contract.client.toLowerCase().includes(s) ||
                           contract.type.toLowerCase().includes(s);
      const matchesStatus = selectedStatus === "all" || contract.status === selectedStatus;
      const matchesType = selectedType === "all" || contract.type === selectedType;

      let matchesValue = true;
      if (valueRange !== "all") {
        const value = Number(contract.value) || 0;
        switch (valueRange) {
          case "low": matchesValue = value < 50000; break;
          case "medium": matchesValue = value >= 50000 && value < 200000; break;
          case "high": matchesValue = value >= 200000; break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesValue;
    });

    // Sort contracts
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === "due" || sortBy === "startDate") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (sortBy === "value") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedContracts, searchTerm, selectedStatus, selectedType, valueRange, sortBy, sortOrder]);

  const getStatusInfo = (status) => {
    return contractStatuses.find(s => s.value === status) || contractStatuses[0];
  };

  const formatCurrency = (value) => {
    const numValue = Number(value) || 0;
    if (numValue === 0) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(numValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return Infinity;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingContract) {
      addContract(e);
    } else {
      addContract(e);
    }
  };

  const totalValue = enhancedContracts.reduce((sum, contract) => sum + (Number(contract.value) || 0), 0);
  const activeContracts = enhancedContracts.filter(c => c.status === 'active').length;
  const expiringContracts = enhancedContracts.filter(c => c.status === 'expiring').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedContracts.length} contracts • {selectedContracts.size} selected
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button 
            onClick={() => { setShowForm(true); setEditingContract(null); setEnhancedForm({
              title: "", value: "", due: "", startDate: "", type: "Service Agreement",
              status: "draft", client: "", description: "", priority: "medium",
              renewalTerms: "", paymentTerms: ""
            }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contracts</p>
              <p className="text-2xl font-bold text-blue-600">{activeContracts}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{expiringContracts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-800">{enhancedContracts.length}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
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
              placeholder="Search contracts, clients, or types..."
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {contractStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {contractTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={valueRange}
              onChange={(e) => setValueRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Values</option>
              <option value="low">Under $50K</option>
              <option value="medium">$50K - $200K</option>
              <option value="high">Over $200K</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="due-asc">Due Date (Earliest)</option>
              <option value="due-desc">Due Date (Latest)</option>
              <option value="value-desc">Value (Highest)</option>
              <option value="value-asc">Value (Lowest)</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Contract Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingContract ? "Edit Contract" : "Add New Contract"}
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Title *</label>
                  <input
                    type="text"
                    value={enhancedForm.title || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client/Partner *</label>
                  <input
                    type="text"
                    value={enhancedForm.client || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, client: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value *</label>
                  <input
                    type="number"
                    value={enhancedForm.value || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, value: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                  <select
                    value={enhancedForm.type || "Service Agreement"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {contractTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={enhancedForm.startDate || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={enhancedForm.due || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, due: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={enhancedForm.status || "draft"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {contractStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    value={enhancedForm.priority || "medium"}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={enhancedForm.description || ""}
                  onChange={(e) => setEnhancedForm(f => ({ ...f, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the contract..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={enhancedForm.paymentTerms || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, paymentTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Net 30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renewal Terms</label>
                  <input
                    type="text"
                    value={enhancedForm.renewalTerms || ""}
                    onChange={(e) => setEnhancedForm(f => ({ ...f, renewalTerms: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Auto-renewal for 1 year"
                  />
                </div>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingContract ? "Update Contract" : "Add Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredAndSortedContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== "all" || selectedType !== "all" 
                ? "Try adjusting your search or filters"
                : "Get started by creating your first contract"
              }
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Contract
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client & Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value & Terms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedContracts.map((contract) => {
                  const statusInfo = getStatusInfo(contract.status);
                  const daysUntilDue = getDaysUntilDue(contract.due);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-start space-x-3">
                          <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                            {contract.starred ? 
                              <Star className="w-4 h-4 text-yellow-500 fill-current" /> : 
                              <StarOff className="w-4 h-4" />
                            }
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.title}</div>
                            {contract.description && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {contract.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs ${priorityLevels.find(p => p.value === contract.priority)?.color || 'text-gray-600'}`}>
                                {priorityLevels.find(p => p.value === contract.priority)?.label || 'Medium'}
                              </span>
                              {contract.progress !== undefined && (
                                <div className="flex items-center gap-1">
                                  <div className="w-12 h-1 bg-gray-200 rounded-full">
                                    <div 
                                      className="h-1 bg-blue-500 rounded-full" 
                                      style={{ width: `${contract.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{contract.progress}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-900">{contract.client}</span>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contract.type}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(contract.value)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {contract.paymentTerms}
                          </div>
                          {contract.renewalTerms && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {contract.renewalTerms}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {contract.startDate && (
                            <div className="text-xs text-gray-600">
                              Start: {formatDate(contract.startDate)}
                            </div>
                          )}
                          <div className="text-sm text-gray-900">
                            Due: {formatDate(contract.due)}
                          </div>
                          {daysUntilDue >= 0 && (
                            <div className={`text-xs ${daysUntilDue <= 30 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {daysUntilDue === 0 ? "Due today" : 
                               daysUntilDue === 1 ? "Due tomorrow" :
                               `${daysUntilDue} days left`}
                            </div>
                          )}
                          {daysUntilDue < 0 && (
                            <div className="text-xs text-red-600">
                              Overdue by {Math.abs(daysUntilDue)} days
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        {(contract.status === 'expiring' || daysUntilDue <= 30) && daysUntilDue > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              <Bell className="w-3 h-3 mr-1" />
                              Action needed
                            </span>
                          </div>
                        )}
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
                              setEditingContract(contract);
                              setEnhancedForm({...contract});
                              setShowForm(true);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-600 transition-colors" 
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors" 
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-purple-600 transition-colors" 
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                            title="Send reminder"
                          >
                            <Send className="w-4 h-4" />
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

      {/* Expiring Contracts Alert */}
      {expiringContracts > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  {expiringContracts} contract{expiringContracts !== 1 ? 's' : ''} expiring soon
                </h3>
                <p className="text-xs text-orange-600 mt-1">
                  Review and take action to avoid service interruptions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white border border-orange-300 text-orange-700 rounded hover:bg-orange-50 transition-colors">
                Review All
              </button>
              <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract Value Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Distribution</h3>
          <div className="space-y-3">
            {contractTypes.slice(0, 5).map(type => {
              const count = enhancedContracts.filter(c => c.type === type).length;
              const percentage = enhancedContracts.length > 0 ? (count / enhancedContracts.length * 100).toFixed(1) : 0;
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
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

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Generate Contract Report</div>
                <div className="text-xs text-gray-500">Download comprehensive contract analysis</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Setup Renewal Alerts</div>
                <div className="text-xs text-gray-500">Configure automatic renewal notifications</div>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Contract Analytics</div>
                <div className="text-xs text-gray-500">View performance metrics and trends</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}