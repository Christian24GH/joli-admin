import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DocumentManagement() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', file: null });
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Alice', role: 'editor' });
  const [previewDoc, setPreviewDoc] = useState(null);

  function addDocument(e) {
    e.preventDefault();
    const doc = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      version: 1,
      status: 'pending',
      archived: false,
      permissions: { view: ['admin', 'editor', 'viewer'], edit: ['admin', 'editor'], approve: ['admin'] },
    };
    setDocuments([...documents, doc]);
    setForm({ title: '', category: '', file: null });
  }

  function approveDocument(id) {
    setDocuments(documents.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)));
  }

  function archiveOld(id) {
    setDocuments(documents.map((d) => (d.id === id ? { ...d, archived: true } : d)));
  }

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase())
  );

  function canPerform(doc, action) {
    return doc.permissions[action]?.includes(currentUser.role);
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Document Management</h2>
      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="role">Switch Role:</Label>
        <select
          id="role"
          className="border rounded p-2"
          value={currentUser.role}
          onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role})
      </p>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {currentUser.role !== 'viewer' && (
        <Card className="p-4 mb-6">
          <CardContent>
            <form onSubmit={addDocument} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={!['admin', 'editor'].includes(currentUser.role)}
                />
              </div>
              <div>
                <Label>Category/Tags</Label>
                <Input
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  disabled={!['admin', 'editor'].includes(currentUser.role)}
                />
              </div>
              <div>
                <Label>Upload File</Label>
                <Input
                  type="file"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                  disabled={!['admin', 'editor'].includes(currentUser.role)}
                />
              </div>
              <div className="md:col-span-3 text-right">
                <Button type="submit" disabled={!['admin', 'editor'].includes(currentUser.role)}>
                  Add Document
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card className="p-4">
        <CardContent>
          <h3 className="font-semibold text-lg mb-3">Document Repository</h3>
          {filteredDocs.length === 0 ? (
            <p className="text-sm text-slate-500">No documents found.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2">Title</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Version</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Archived</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="border-t">
                    <td className="p-2">{doc.title}</td>
                    <td className="p-2">{doc.category}</td>
                    <td className="p-2">v{doc.version}</td>
                    <td className="p-2">{doc.status}</td>
                    <td className="p-2">{doc.archived ? 'Yes' : 'No'}</td>
                    <td className="p-2 flex gap-2">
                      {canPerform(doc, 'approve') && doc.status !== 'approved' && (
                        <Button size="sm" onClick={() => approveDocument(doc.id)}>Approve</Button>
                      )}
                      {canPerform(doc, 'edit') && !doc.archived && (
                        <Button size="sm" variant="secondary" onClick={() => archiveOld(doc.id)}>
                          Archive
                        </Button>
                      )}
                      {canPerform(doc, 'view') && (
                        <Button size="sm" variant="outline" onClick={() => setPreviewDoc(doc)}>View</Button>
                      )}
                      {!canPerform(doc, 'view') && <span className="text-xs text-slate-400">No access</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Document Preview</h3>
            <p><strong>Title:</strong> {previewDoc.title}</p>
            <p><strong>Category:</strong> {previewDoc.category}</p>
            <p><strong>Version:</strong> v{previewDoc.version}</p>
            <p><strong>Status:</strong> {previewDoc.status}</p>
            <p><strong>Archived:</strong> {previewDoc.archived ? 'Yes' : 'No'}</p>
            <div className="mt-4 text-right">
              <Button variant="secondary" onClick={() => setPreviewDoc(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}