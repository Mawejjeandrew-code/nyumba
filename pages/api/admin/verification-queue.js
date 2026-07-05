import { useEffect, useState } from 'react';
import AdminLayout from '../componnents/AdminLayout';
import { Badge, Card, EmptyState, Button } from  '../../components/ui';
import { adminFetch } from '../../lib/adminFetch';

function urgencyTone(hoursLeft, escalated) {
    if (escalated || hoursLeft  === null || hoursLeft < 0) return 'overdue';
    if (hoursLeft < 4) return 'high';
    if (hoursLeft < 12) return 'medium';
    return null
}

function formatHours(h) {
    if (h === null) return '-';
    if (h < 0) return `${Math.abs(h)}h overdue`;
    return `${h}h left`
}


export default function VerificationQueue() {
    const [queue, setQueue] = useState(null);
    const [agents, setAgents] = useState([]);
    const[error,  setError] = useState('');
    const [reassigning, setReassigning] = useState(null);
    const [busy, setBusy] = useState(false);

    function load() {
        Promise.all([
            adminFetch('/admin/verification-queue'),
            adminFetch('/admin/agents'),

        ])
           .then(([queue, a]) => {
            setQueue(queue.queue);
            setAgents(a.agents.filter((ag) => ag.is_active));

           })
           .catch((e) => setError(e.message));

    }

    useEffect(load, []);

    async function handleReassign(listingId, newAgentId) {
        if (!newAgentId) return;
        setBusy(true);
        try {
            await adminFetch('/admin/verification-queue/reassign', {
                method: 'POST',
                body: { listing_id = listingId, new_agent_id: newAgentId},

            });
            setReassigning(null);
            load();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <AdminLayout title="Verification queue">
            {error && <EmptyState>{error}</EmptyState>}
            {!queue && !error && <EmptyState>Loading the queue...</EmptyState>}
            {queue && queue.length == 0 && (
                <EmptyState>Nothing waiting - every listing is verified.</EmptyState>
            )}
            {queue && queue.length > 0 && (
                <Card>
                    <table>
                        <thead>
                            <tr>
                                <th>Listing</th>
                                <th>Area</th>
                                <th>Status</th>
                                <th>Agent</th>
                                <th>Deadline</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {queue.map((item) => {
                                const tone = urgencyTone(item.hours_left, item.escalated);
                                return (
                                    <tr key={item.id}>
                                        <td className="title-cell">{item.title || 'Untitled listing'}</td>
                                        <td>{item.area || '-'}</td>
                                        <td>
                                            <Badge tone={item.status}>{item.status.replace('-', ' ')}</Badge>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Card>
            )}
        </AdminLayout>
    )
}