"use client";

import { useState, useEffect } from "react";
import { getServices, deleteService, getAppointments, updateService, toggleServiceStatus } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

export default function ManageServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  
  // Create form state
  const [formData, setFormData] = useState({ name: "", description: "", price: "", durationInMinutes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Edit form state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: 0, name: "", description: "", price: "", durationInMinutes: "" });

  const fetchData = async () => {
    try {
      const [svcData, apptData] = await Promise.all([getServices(), getAppointments()]);
      setServices(svcData);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        durationInMinutes: parseInt(formData.durationInMinutes, 10)
      };

      const res = await fetch("http://localhost:8080/api/services", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast("Serviço cadastrado com sucesso!", "success");
        setFormData({ name: "", description: "", price: "", durationInMinutes: "" });
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

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
      showToast("Serviço excluído com sucesso.", "success");
    } catch (e: any) {
      showToast("Erro ao excluir serviço: " + e.message, "error");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (!confirm(`Tem certeza que deseja ${currentStatus ? 'desativar' : 'ativar'} este serviço?`)) return;
    try {
      await toggleServiceStatus(id);
      showToast(`Serviço ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`, "success");
      fetchData();
    } catch (e: any) {
      showToast("Erro ao alterar estado: " + e.message, "error");
    }
  };

  const openReport = (service: any) => {
    setSelectedService(service);
    setIsReportOpen(true);
  };

  const openEdit = (service: any) => {
    setEditFormData({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      durationInMinutes: service.durationInMinutes.toString()
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        durationInMinutes: parseInt(editFormData.durationInMinutes, 10)
      };

      await updateService(editFormData.id, payload);
      showToast("Serviço atualizado com sucesso!", "success");
      fetchData();
      setIsEditOpen(false);
    } catch (e: any) {
      showToast("Erro ao atualizar: " + e.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceAppointments = selectedService 
    ? appointments.filter(app => app.serviceName === selectedService.name)
    : [];

  const totalRevenue = serviceAppointments.length * (selectedService?.price || 0);

  return (
    <div className="w-full text-zinc-100">
      <h1 className="text-3xl font-black text-zinc-50 mb-8 border-b border-zinc-800 pb-4">
        Gerir <span className="text-amber-500">Serviços</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Novo Serviço
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome do Serviço</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Corte de Cabelo"
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Descrição</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="Ex: Corte estilo degradê..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Preço (R$)</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required placeholder="Ex: 15.00"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duração (min)</label>
                <input type="number" name="durationInMinutes" value={formData.durationInMinutes} onChange={handleChange} required placeholder="Ex: 30"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-zinc-950 font-bold p-4 rounded-xl hover:bg-amber-400 transition-colors mt-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              {isSubmitting ? "Salvando..." : "Cadastrar Serviço"}
            </button>
          </form>
        </div>

        {/* Lista de Serviços */}
        <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Serviços Cadastrados
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500 border-opacity-75"></div>
            </div>
          ) : services.length === 0 ? (
            <p className="text-zinc-500 text-sm italic text-center py-10">Nenhum serviço cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((s) => (
                <div key={s.id} className="border border-zinc-800 bg-zinc-950 p-5 rounded-2xl hover:border-amber-500/30 transition-colors relative group overflow-hidden">
                  {!s.active && (
                    <div className="absolute top-3 right-3 bg-red-900/30 text-red-400 border border-red-800/50 text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      INATIVO
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-3 pr-16">
                    <h3 className="font-bold text-zinc-100 text-lg group-hover:text-amber-500 transition-colors">{s.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{s.description}</p>
                  
                  <div className="flex justify-between items-center text-xs border-t border-zinc-800 pt-4 mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-300 font-semibold bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">⏱ {s.durationInMinutes} min</span>
                      <span className="text-amber-500 font-extrabold text-sm">R${s.price?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end items-center gap-1.5">
                      <button onClick={() => openReport(s)} title="Relatório" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </button>
                      <button onClick={() => openEdit(s)} title="Editar" className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(s.id, s.active)} 
                        title={s.active ? 'Desativar' : 'Ativar'}
                        className={`p-2 rounded-xl transition-all border cursor-pointer ${s.active ? 'text-zinc-400 border-zinc-800 hover:text-orange-500 hover:bg-orange-500/10' : 'text-zinc-400 border-zinc-800 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                      >
                        {s.active ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                      </button>
                      <button onClick={() => handleDelete(s.id)} title="Remover" className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-zinc-800 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Relatório */}
      {isReportOpen && selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative animate-slide-in">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-black text-zinc-50 mb-1">{selectedService.name}</h2>
            <p className="text-sm text-zinc-400 mb-6">Relatório de Desempenho do Serviço</p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Realizados</span>
                <span className="text-2xl font-black text-zinc-550">{serviceAppointments.length}</span>
              </div>
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Receita Gerada</span>
                <span className="text-2xl font-black text-amber-500">R${totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setIsReportOpen(false)} className="w-full bg-zinc-800 text-white font-bold p-3.5 rounded-xl hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-700">
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
            <h2 className="text-xl font-bold text-zinc-50 mb-6 border-b border-zinc-800 pb-2">Editar Serviço</h2>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Nome do Serviço</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Descrição</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} required rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Preço (R$)</label>
                  <input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Duração (min)</label>
                  <input type="number" name="durationInMinutes" value={editFormData.durationInMinutes} onChange={handleEditChange} required
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 p-3 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                </div>
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
