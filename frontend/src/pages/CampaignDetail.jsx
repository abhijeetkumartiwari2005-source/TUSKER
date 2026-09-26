import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';

const SOCKET_URL = 'http://localhost:5000';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    api.get(`/campaigns/${id}`)
      .then(res => setCampaign(res.data.campaign))
      .catch(err => setError(err.response?.data?.message || 'Failed to load campaign'));

    const socket = io(SOCKET_URL);
    socket.emit('join-campaign', id);
    socket.on('progress', (data) => {
      if (data.campaignId === id) setProgress(data);
    });

    return () => socket.disconnect();
  }, [id]);

  const handleSend = async () => {
    setError('');
    try {
      await api.post(`/campaigns/${id}/send`);
      setCampaign(prev => ({ ...prev, status: 'queued' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send campaign');
    }
  };

  if (!campaign) return <p>{error || 'Loading...'}</p>;

  const sent = progress?.sent ?? campaign.sentEmails;
  const total = progress?.total ?? campaign.totalEmails;
  const percent = total > 0 ? Math.round((sent / total) * 100) : 0;

  return (
    <div>
      <h2>{campaign.name}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Status: {progress?.status || campaign.status}</p>
      <p>Recipients: {campaign.totalEmails}</p>

      <div style={{ border: '1px solid #ccc', width: '300px', height: '20px' }}>
        <div style={{ width: `${percent}%`, background: 'green', height: '100%' }} />
      </div>
      <p>{sent} / {total} sent ({percent}%)</p>

      <button onClick={handleSend} disabled={campaign.status !== 'draft'}>
        Send Campaign
      </button>
    </div>
  );
}