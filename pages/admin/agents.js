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
                         
                        />
                      </form>
                    </Card>
                )}
            )}
        </AdminLayout>
    )


}