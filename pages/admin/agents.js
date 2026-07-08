import { useEffect, useState } from "react";    
import AdminLayout from "@/components/AdminLayout";
import { Badge, Card, EmptyState, Button } from '../../components/ui';
import { adminFetch } from "@/lib/adminFetch";

export default function Agents() {
    const [agents, setAgents] = useState(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({name: '', phone: '', area: ''});
    const [showForm, setShowForm] = useState(false);
    const [newToken, setNewToken] = useState(null);
    const [busy, setBusy] = useState(false);                                    

    function load() {
        adminFetch('/admin/agents')
          .then((d) => setAgents(d.agents))
          .catch((e) => setError(e.messag));



    }
    useEffect(load, []);

    async function handleAdd(e) {
        e.preventDefault();
        setBusy(true);
        try {
            const result = await adminFetch('/admin/agents', { method: 'POST', body: form});
            setNewToken(result.agent_token);
            setForm({ name: '', phone: '', area: ''});
            setShowForm(false);
            load();
        } catch (err) {
            setError(err.message);

        } finally {
            setBusy(false);

        }

    }

    async function toggleActive(agent) {
        try {
            await adminFetch('/admin/agents/toggle', {
                method: 'POST',
                body: { agent_id: agent_id, is_active: !agent.is_active },
            });
            load();
        } catch (e) {
            setError(e.message);

        }

    }
    return (
        <AdminLayout title= "Field agents">
            {error && <EmptyState>{error}</EmptyState>}

            {newToken && (
                <div className="token-banner">
                    <div>
                        <strong>Agent added.</strong> Copy their access token now - it won't show again.
                        Give it to them directly; it's what lets them submit verification decisions.
                    </div>
                    <code>{newToken}</code>
                    <button variant="primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel': 'Add agent'}
                    </button>

                </div>

                {showForm && (
                    <Card>
                      <form onSubmit={handleAdd} className="">
                         <input
                          placeholder="full Name"
                          required
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, name: e.target.value})}
                        />
                        <input
                            placeholder="Phone (e.g. 0701234567)"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        
                        />
                        <input
                            placeholder="Coverage area (e.g. Ntinda, Kampala)"
                            value={form.area}
                            onChange={(e) => setForm({ ...form, area: e.target.value })}
                        />
                        <Button variant="amber" disabled={busy}>
                             {busy ? 'Adding…' : 'Create agent + generate token'}
                        </Button>
                      </form>
                    </Card>
                )}
                
                {!agents && !error && <EmptyState>Loading agents…</EmptyState>}
                {agents && agents.length === 0 && <EmptyState>No field agents yet — add the first one above.</EmptyState>}
                {agents && agents.length > 0 && (
                <Card>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Area</th>
                                <th>Workload</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map((a) => (
                                <tr key={a.id}>
                                <td className="name-cell">{a.name}</td>
                                <td>{a.phone}</td>
                                <td>{a.area || '—'}</td>
                                <td>{a.current_workload ?? 0}</td>
                                <td>
                                    <Badge tone={a.is_active ? 'active' : 'inactive'}>
                                    {a.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="actions">
                                    <Button onClick={() => toggleActive(a)}>
                                    {a.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
            
            <style jsx>{`
                .toolbar {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 16px;
                }
                .token-banner {
                background: #fdf1dd;
                border: 1px solid #e8a33d;
                border-radius: 10px;
                padding: 16px 18px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                font-size: 13px;
                color: #4a3a10;
                }
                .token-banner code {
                background: #29200a;
                color: #f4f2ee;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 12px;
                flex-shrink: 0;
                }
                .token-banner button {
                border: none;
                background: transparent;
                color: #b8720c;
                font-weight: 600;
                cursor: pointer;
                flex-shrink: 0;
                }
                .form {
                display: flex;
                gap: 10px;
                padding: 18px 20px;
                flex-wrap: wrap;
                }
                .form input {
                flex: 1;
                min-width: 160px;
                padding: 9px 12px;
                border: 1px solid #d8d2c2;
                border-radius: 7px;
                font-size: 14px;
                }
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
                }
                tr:last-child td {
                border-bottom: none;
                }
                .name-cell {
                font-weight: 600;
                color: #0d2018;
                }
                .actions {
                text-align: right;
                }
            `}</style>

        </AdminLayout>
    );


}