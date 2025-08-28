// app/admin/convites/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Campaign } from '@/types/Campaign'; // NOVO: Import Campaign type

type CreateInviteResponse = {
    link: string
    tokenPreview: string
    inviteId: string
    expiresAt: string
    campaignId: string
    campaignName: string
}

export default function AdminConvitesPage() {
    const [campaignId, setCampaignId] = useState('') // Será preenchido com a campanha selecionada
    const [campaignName, setCampaignName] = useState('') // Será preenchido
    const [singleUse, setSingleUse] = useState(true)
    const [expDays, setExpDays] = useState(1)
    const [participantName, setParticipantName] = useState('')
    const [participantEmail, setParticipantEmail] = useState('')
    const [creating, setCreating] = useState(false)
    const [result, setResult] = useState<CreateInviteResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loadingDefaults, setLoadingDefaults] = useState(true); // NOVO
    const router = useRouter()

    useEffect(() => {
        const token = sessionStorage.getItem('adminToken')
        const email = sessionStorage.getItem('adminEmail')
        const storedSelectedCampaignId = sessionStorage.getItem('selectedCampaignId'); // Pega o ID da campanha selecionada

        if (!token || !email) {
            router.push('/admin/login');
            return;
        }
        if (!storedSelectedCampaignId) {
            alert('Nenhuma campanha selecionada. Por favor, selecione uma campanha.');
            router.push('/admin/campaigns');
            return;
        }
        setCampaignId(storedSelectedCampaignId); // Define o ID da campanha padrão

        // Carrega os padrões da campanha da API com base no selectedCampaignId
        fetch(`/api/admin/config?campaignId=${storedSelectedCampaignId}`)
          .then(r => r.json())
          .then((cfg: Campaign) => { // Usa tipo Campaign
            if (cfg?.name) setCampaignName(cfg.name);
            if (typeof cfg?.singleUseInvitesDefault === 'boolean') setSingleUse(cfg.singleUseInvitesDefault);
            if (typeof cfg?.inviteExpirationDaysDefault === 'number') setExpDays(cfg.inviteExpirationDaysDefault);
          })
          .catch(err => console.error("Failed to load campaign defaults:", err))
          .finally(() => setLoadingDefaults(false));
    }, [router]);

    async function createInvite(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setResult(null)
        setCreating(true)
        try {
            const res = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('adminToken')}`,
                },
                body: JSON.stringify({
                    campaignId, // Este é o ID da campanha selecionada
                    singleUse,
                    expDays,
                    participant: participantName || participantEmail ? { name: participantName || undefined, email: participantEmail || undefined } : undefined,
                }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.message || 'Falha ao gerar convite')
            }
            const data = (await res.json()) as CreateInviteResponse
            setResult(data)
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setCreating(false)
        }
    }

    if (loadingDefaults) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted">Carregando padrões da campanha...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Gerar Convites para Campanha: {campaignName}</h1>
                    <Link href="/admin" className="btn btn-ghost">← Voltar</Link>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <form onSubmit={createInvite} className="card p-6 space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Campanha (ID)</label>
                        <input value={campaignId} disabled className="w-full p-3 border border-border rounded-lg bg-card cursor-not-allowed opacity-70" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Nome da campanha</label>
                        <input value={campaignName} disabled className="w-full p-3 border border-border rounded-lg bg-card cursor-not-allowed opacity-70" />
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={singleUse} onChange={(e)=>setSingleUse(e.target.checked)} /> Uso único
                        </label>
                        <div>
                            <label className="block text-sm mb-1">Expiração (dias)</label>
                            <input type="number" min={1} value={expDays} onChange={(e)=>setExpDays(parseInt(e.target.value||'1',10))} className="w-28 p-3 border border-border rounded-lg bg-card" />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Nome (opcional)</label>
                            <input value={participantName} onChange={(e)=>setParticipantName(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card" />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">E-mail (opcional)</label>
                            <input type="email" value={participantEmail} onChange={(e)=>setParticipantEmail(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-card" />
                        </div>
                    </div>
                    <button type="submit" disabled={creating} className={`btn btn-primary ${creating?'opacity-50 cursor-not-allowed':''}`}>
                        {creating ? 'Gerando…' : 'Gerar Convite'}
                    </button>
                    {error && <div className="mt-2 text-error text-sm">{error}</div>}
                </form>
  
                {result && (
                    <div className="card p-6 mt-6 space-y-2">
                        <div className="text-sm text-muted">Convite gerado</div>
                        <div className="font-mono break-all">{result.link}</div>
                        <div className="text-sm">Expira em: {new Date(result.expiresAt).toLocaleString('pt-BR')}</div>
                        <div className="text-sm">Campanha: {result.campaignName}</div>
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-ghost" onClick={()=>navigator.clipboard.writeText(result.link)}>Copiar link</button>
                            <Link className="btn btn-ghost" href={result.link} >Abrir link</Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}