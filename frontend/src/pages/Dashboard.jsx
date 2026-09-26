import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/campaigns')
      .then(res => setCampaigns(res.data.campaigns))
      .catch(err => setError(err.response?.data?.message || 'Failed to load campaigns'));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <h2>Your Campaigns</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Link to="/campaigns/new">+ New Campaign</Link>
      <ul>
        {campaigns.map(c => (
          <li key={c._id}>
            <Link to={`/campaigns/${c._id}`}>{c.name}</Link> — {c.status} ({c.sentEmails}/{c.totalEmails})
            <button onClick={() => handleDelete(c._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}