"use client";

import { useState, useEffect } from "react";
import { getBarbers, deleteBarber, getAppointments, updateBarber, toggleBarberStatus } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export default function ManageBarbersPage() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  
  // Create form state
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", phoneNumber: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Edit form state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: "", fullName: "", email: "", password: "", phoneNumber: "" });

  const fetchData = async () => {
    try {
      const [barberData, apptData] = await Promise.all([getBarbers(), getAppointments()]);
      setBarbers(barberData);
      setAppointments(apptData);
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/barbers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showToast("Barbeiro cadastrado com sucesso!", "success");
        setFormData({ fullName: "", email: "", password: "", phoneNumber: "" });
        fetchData();
      } else {
        const err = await res.json().catch(() => null);
        showToast("Erro ao cadastrar: " + (err?.message || res.statusText), "error");
      }
    } catch (e: any) {
      showToast("Erro de conexão: " + e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este barbeiro?")) return;
    try {
      await deleteBarber(id);
      setBarbers(barbers.filter(b => b.id !== id));
      showToast("Barbeiro excluído com sucesso.", "success");
    } catch (e: any) {
      showToast("Erro ao excluir barbeiro: " + e.message, "error");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Tem certeza que deseja ${currentStatus ? 'desativar' : 'ativar'} este barbeiro?`)) return;
    try {
      await toggleBarberStatus(id);
      showToast(`Barbeiro ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`, "success");
      fetchData();
    } catch (e: any) {
      showToast("Erro ao alterar estado: " + e.message, "error");
    }
  };

  const openReport = (barber: any) => {
    setSelectedBarber(barber);
    setIsReportOpen(true);
  };

  const openEdit = (barber: any) => {
    setEditFormData({
      id: barber.id,
      fullName: barber.fullName,
      email: barber.email,
      password: "", // Não mostrar senha existente
      phoneNumber: barber.phoneNumber
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        ...(editFormData.password ? { password: editFormData.password } : {})
      };

      await updateBarber(editFormData.id, payload);
      showToast("Barbeiro atualizado com sucesso!", "success");
      fetchData();
      setIsEditOpen(false);
    } catch (e: any) {
      showToast("Erro ao atualizar: " + e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const barberAppointments = selectedBarber 
    ? appointments.filter(app => app.barberName === selectedBarber.fullName)
    : [];

  return (
    <div className="w-full text-zinc-100">
      <h1 className="text-3xl font-black text-zinc-50 mb-8 border-b border-zinc-800 pb-4">
        Gerir <span className="text-amber-500">Barbeiros</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Novo Barbeiro
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Ex: Lucas Silva"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="barbeiro@email.com"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Senha Provisória</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder="Ex: 81999999999"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 transition-colors mt-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              {isSubmitting ? "Salvando..." : "Cadastrar Barbeiro"}
            </button>
          </form>
        </div>

        {/* Lista de Barbeiros */}
        <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Equipa Atual
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500 border-opacity-75"></div>
            </div>
          ) : barbers.length === 0 ? (
            <p className="text-zinc-500 text-sm italic text-center py-10">Nenhum barbeiro cadastrado.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="px-5 py-4">Nome</th>
                    <th className="px-5 py-4">E-mail</th>
                    <th className="px-5 py-4">Telefone</th>
                    <th className="px-5 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {barbers.map((b) => (
                    <tr key={b.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-5 py-4 font-bold text-zinc-100 flex items-center gap-2">
                        {b.fullName}
                        {!b.active && (
                          <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/50 px-2.5 py-0.5 rounded-full font-bold">
                            INATIVO
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{b.email}</td>
                      <td className="px-5 py-4 text-zinc-400">{b.phoneNumber}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button onClick={() => openReport(b)} title="Relatório" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                          </button>
                          
                          <button onClick={() => openEdit(b)} title="Editar" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          </button>
                          
                          <button 
                            onClick={() => handleToggleStatus(b.id, b.active)} 
                            title={b.active ? 'Desativar' : 'Ativar'}
                            className={`p-2 rounded-xl transition-all border cursor-pointer ${b.active ? 'text-zinc-400 border-zinc-800 hover:text-orange-500 hover:bg-orange-500/10' : 'text-zinc-400 border-zinc-800 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                          >
                            {b.active ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            )}
                          </button>
                          
                          <button onClick={() => handleDelete(b.id)} title="Remover" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Relatório */}
      {isReportOpen && selectedBarber && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-in">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-black text-zinc-50 mb-1">{selectedBarber.fullName}</h2>
            <p className="text-sm text-zinc-400 mb-6">Relatório de Atendimentos</p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cortes Agendados</span>
                <span className="text-2xl font-black text-zinc-50">{barberAppointments.length}</span>
              </div>
            </div>

            <button onClick={() => setIsReportOpen(false)} className="w-full bg-zinc-800 text-white font-bold p-3.5 rounded-xl hover:bg-zinc-700 transition-colors border border-zinc-700 cursor-pointer">
              Fechar Relatório
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-in">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-xl font-bold text-zinc-50 mb-6 border-b border-zinc-800 pb-2">Editar Barbeiro</h2>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome Completo</label>
                <input type="text" name="fullName" value={editFormData.fullName} onChange={handleEditChange} required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">E-mail</label>
                <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nova Senha (Opcional)</label>
                <input type="password" name="password" value={editFormData.password} onChange={handleEditChange} placeholder="Deixe em branco para manter" minLength={6}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Telefone</label>
                <input type="text" name="phoneNumber" value={editFormData.phoneNumber} onChange={handleEditChange} required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 transition-colors mt-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
