"use client";

import { useState, useEffect } from "react";
import { getServices, deleteService, getAppointments, updateService, toggleServiceStatus } from "../../services/api";

export default function ManageServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create form state
  const [formData, setFormData] = useState({ name: "", description: "", price: "", durationInMinutes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Modal states
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Edit form state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: 0, name: "", description: "", price: "", durationInMinutes: "" });
  const [editStatus, setEditStatus] = useState({ type: "", message: "" });

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
    setStatus({ type: "", message: "" });

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
        setStatus({ type: "success", message: "Serviço cadastrado com sucesso!" });
        setFormData({ name: "", description: "", price: "", durationInMinutes: "" });
        fetchData();
      } else {
        const err = await res.json().catch(() => null);
        setStatus({ type: "error", message: "Erro: " + (err?.message || res.statusText) });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: "Erro de conexão: " + e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      await deleteService(id);
      setServices(services.filter(s => s.id !== id));
      alert("Serviço excluído com sucesso.");
    } catch (e: any) {
      alert("Erro ao excluir serviço: " + e.message);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    if (!confirm(`Tem certeza que deseja ${currentStatus ? 'desativar' : 'ativar'} este serviço?`)) return;
    try {
      await toggleServiceStatus(id);
      fetchData();
    } catch (e: any) {
      alert("Erro ao alterar estado: " + e.message);
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
    setEditStatus({ type: "", message: "" });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setEditStatus({ type: "", message: "" });

    try {
      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        price: parseFloat(editFormData.price),
        durationInMinutes: parseInt(editFormData.durationInMinutes, 10)
      };

      await updateService(editFormData.id, payload);
      setEditStatus({ type: "success", message: "Serviço atualizado com sucesso!" });
      fetchData();
      setTimeout(() => setIsEditOpen(false), 1500);
    } catch (e: any) {
      setEditStatus({ type: "error", message: "Erro ao atualizar: " + e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceAppointments = selectedService 
    ? appointments.filter(app => app.serviceName === selectedService.name)
    : [];

  const totalRevenue = serviceAppointments.length * (selectedService?.price || 0);

  return (
    <div>
      <h1 className="text-3xl font-black text-zinc-900 mb-8">
        Gerir <span className="text-amber-500">Serviços</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário de Cadastro */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 h-fit">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Novo Serviço</h2>
          
          {status.message && (
            <div className={`p-3 rounded-lg mb-4 text-xs font-medium ${
              status.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
            }`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nome do Serviço</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Corte de Cabelo"
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Descrição</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={2} placeholder="Ex: Corte estilo degradê..."
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required placeholder="Ex: 15.00"
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Duração (min)</label>
                <input type="number" name="durationInMinutes" value={formData.durationInMinutes} onChange={handleChange} required placeholder="Ex: 30"
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
            </div>
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white font-bold p-3 rounded-lg hover:bg-zinc-800 transition-colors mt-2">
              {isSubmitting ? "Salvando..." : "Cadastrar"}
            </button>
          </form>
        </div>

        {/* Lista de Serviços */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Serviços Atuais</h2>
          
          {isLoading ? (
            <p className="text-zinc-500 animate-pulse text-sm">Carregando...</p>
          ) : services.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum serviço cadastrado.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((s) => (
                <div key={s.id} className="border border-zinc-100 p-4 rounded-xl hover:shadow-md transition-shadow relative">
                  {!s.active && (
                    <div className="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                      INATIVO
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-zinc-900">{s.name}</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                      R${s.price?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mb-3">{s.description}</p>
                  <div className="flex justify-between items-center text-xs text-zinc-400 font-medium border-t border-zinc-100 pt-3">
                    <span>⏱ {s.durationInMinutes} min</span>
                    <div className="flex justify-end items-center gap-1">
                      <button onClick={() => openReport(s)} title="Relatório" className="p-1.5 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                      </button>
                      <button onClick={() => openEdit(s)} title="Editar" className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(s.id, s.active)} 
                        title={s.active ? 'Desativar' : 'Ativar'}
                        className={`p-1.5 rounded-lg transition-colors border border-transparent ${s.active ? 'text-zinc-400 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-200' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'}`}
                      >
                        {s.active ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                      </button>
                      <button onClick={() => handleDelete(s.id)} title="Remover" className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsReportOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-black text-zinc-900 mb-1">{selectedService.name}</h2>
            <p className="text-sm text-zinc-500 mb-6">Relatório de Desempenho do Serviço</p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-600 uppercase">Total Realizados</span>
                <span className="text-2xl font-black text-zinc-900">{serviceAppointments.length}</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="text-sm font-bold text-amber-800 uppercase">Receita Gerada</span>
                <span className="text-2xl font-black text-amber-600">R${totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setIsReportOpen(false)} className="w-full bg-zinc-900 text-white font-bold p-3 rounded-lg hover:bg-zinc-800 transition-colors">
              Fechar Relatório
            </button>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-xl font-bold text-zinc-900 mb-4">Editar Serviço</h2>
            
            {editStatus.message && (
              <div className={`p-3 rounded-lg mb-4 text-xs font-medium ${
                editStatus.type === "error" ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}>
                {editStatus.message}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Nome do Serviço</label>
                <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} required
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Descrição</label>
                <textarea name="description" value={editFormData.description} onChange={handleEditChange} required rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Preço (R$)</label>
                  <input type="number" step="0.01" name="price" value={editFormData.price} onChange={handleEditChange} required
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Duração (min)</label>
                  <input type="number" name="durationInMinutes" value={editFormData.durationInMinutes} onChange={handleEditChange} required
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 p-2.5 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors" />
                </div>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 text-zinc-900 font-bold p-3 rounded-lg hover:bg-amber-400 transition-colors mt-2">
                {isSubmitting ? "Atualizando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
