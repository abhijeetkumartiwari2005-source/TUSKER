import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CampaignForm() {
  const [name, setName] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'upload'
  const [campaignId, setCampaignId] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/campaigns', { name, emailTemplate });
      setCampaignId(res.data.campaign._id);
      setStep('upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return setError('Select a CSV file first');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/campaigns/${campaignId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  if (step === 'upload') {
    return (
      <form onSubmit={handleUpload}>
        <h2>Upload recipient CSV</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit">Upload</button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCreate}>
      <h2>New Campaign</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input placeholder="Campaign name" value={name} onChange={(e) => setName(e.target.value)} required />
      <textarea placeholder="Email template (HTML/text)" value={emailTemplate} onChange={(e) => setEmailTemplate(e.target.value)} required />
      <button type="submit">Next: Upload CSV</button>
    </form>
  );
}