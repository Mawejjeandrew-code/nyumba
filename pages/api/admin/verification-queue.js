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
                body: { listing_id: listingId, new_agent_id: newAgentId},

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
                                        <td>{item.agent?.name || <span className="muted">Unassigned</span>}</td>
                                        <td>
                                            {tone ? (
                                                <Badge tone={tone}>{formatHours(item.hours_left)}</Badge>
                                            ) : (
                                                <span className="muted">{formatHours(item.hours_left)}</span>
                                            )}
                                        </td>
                                        <td className="actions">
                                            {reassigning === item.id ? (
                                                <select
                                                 autoFocus
                                                 disabled={busy}
                                                 defaultValue=''
                                                 onChange={(e) => handleReassign(item.id, e.target.value)}
                                                 onBlur={() => setReassigning(null)}
                                                >
                                                    <option value="" disabled>Pick an agent...</option>
                                                    {agents.map((a) => (
                                                        <option key={a.id} value={a.id}>
                                                            {a.name} (load: {a.current_workload})
                                                        </option>
                                                    ))}

                                                </select>

                                            ) : (
                                                <Button onClick={() => setReassigning(item.id)}>Reassign</Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </Card>
            )}

            <style jsx>{`
            table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            }
            th {
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: #8a8474;
            border-bottom: 1px solid #e7e3d9;

            }
            td {
            padding: 14px 16px;
            border-bottom: 1px solid #f0ede4;
            vertical-align: middle;
            }
            tr: last-child td {
              border-bottom: none;
            
            }
             .title-cell {
               font-weight: 600;
               color: #0d2018;
             }
               .muted {
               color: #a39c89;
               }
            .actions {
               text-align: right;
            } 
            select {
            font-size: 13px;
            padding: 5px 8px;
            border-radiud: 6px;
            border: 1px solid #d8d2c2;
            }     

            `
                }

            </style>
        </AdminLayout>
    );
}