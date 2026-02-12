"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Users, User, Eye, ChevronLeft, ChevronRight, Upload, LogOut } from "lucide-react";
import { PersonaDefunta, PersonaDefuntaCreate, SearchResponse } from "@/types/persona";
import { formatRegistroDisplay } from "@/lib/utils";

const API = "/api";

export default function Home() {
  const { data: session } = useSession();
  const [persone, setPersone] = useState<PersonaDefunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{totalPersone: number; personeWithPadre: number; personeWithMadre: number; personeWithConiuge: number}>({totalPersone: 0, personeWithPadre: 0, personeWithMadre: 0, personeWithConiuge: 0});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPersone, setTotalPersone] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDefunta | null>(null);
  const [editingPersona, setEditingPersona] = useState<PersonaDefunta | null>(null);
  const [activeTab, setActiveTab] = useState('semplice');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);
  const [advancedSearch, setAdvancedSearch] = useState({
    nome: "",
    cognome: "",
    padre: "",
    nome_madre: "",
    cognome_madre: "",
    nome_coniuge: "",
    cognome_coniuge: "",
    anno_nascita: "",
    anno_decesso: ""
  });
  const [activeNavButton, setActiveNavButton] = useState<'prev' | 'next' | null>(null);

  const handleNavButtonPress = (type: 'prev' | 'next') => setActiveNavButton(type);
  const clearNavButtonState = () => setActiveNavButton(null);

  const [formData, setFormData] = useState<PersonaDefuntaCreate>({
    anno: undefined,
    nome: "",
    cognome: "",
    padre: "",
    data_decesso: "",
    luogo_decesso: "",
    nascita: "",
    luogo_nascita: "",
    eta: "",
    data_matrimonio: "",
    nome_madre: "",
    cognome_madre: "",
    nome_coniuge: "",
    cognome_coniuge: "",
    registro: "",
    visibile: true,
    mostra_coniuge: true,
    note: ""
  });

  // Funzione per validare formato data
  const validateDateFormat = (value: string): boolean => {
    if (!value.trim()) return true; // Vuoto è permesso
    
    // Solo anno: (1809) o 1809
    const yearOnlyRegex = /^(\(?\d{4}\)?)$/;
    if (yearOnlyRegex.test(value.trim())) return true;
    
    // Data completa: dd/mm/yyyy o dd/mm/yy
    const fullDateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
    if (fullDateRegex.test(value.trim())) {
      const [, day, month, year] = value.trim().match(fullDateRegex) || [];
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      return dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12;
    }
    
    return false;
  };

  const loadPersone = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        pagina: currentPage,
        per_pagina: 5,
        admin: true,  // Parametro per mostrare tutte le persone, incluse quelle nascoste
        ...(searchTerm && { ricerca: searchTerm }),
        ...Object.entries(advancedSearch).reduce((acc, [key, value]) => {
          if (value.trim()) acc[key] = value.trim();
          return acc;
        }, {} as Record<string, string>)
      };

      const response = await axios.get<SearchResponse>(`${API}/persone`, { params });
      setPersone(response.data.persone);
      setTotalPages(response.data.totale_pagine);
      setTotalPersone(response.data.totale);
    } catch (error) {
      console.error("Errore nel caricamento delle persone:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/persone/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    }
  };

  // Carica lo stato della modalità manutenzione
  const loadMaintenanceStatus = async () => {
    try {
      const response = await axios.get('/api/maintenance');
      setMaintenanceMode(response.data.enabled);
    } catch (error) {
      console.error("Errore nel caricamento dello stato manutenzione:", error);
    }
  };

  // Toggle modalità manutenzione
  const toggleMaintenanceMode = async () => {
    try {
      const newStatus = !maintenanceMode;
      await axios.post('/api/maintenance', { enabled: newStatus });
      setMaintenanceMode(newStatus);
      alert(newStatus ? 'Modalità manutenzione attivata' : 'Modalità manutenzione disattivata');
    } catch (error) {
      console.error("Errore nel cambiare modalità manutenzione:", error);
      alert('Errore nel cambiare modalità manutenzione');
    }
  };

  useEffect(() => {
    loadPersone();
    loadStats();
    loadMaintenanceStatus();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: PersonaDefuntaCreate = {
        ...formData,
        data_matrimonio: formData.data_matrimonio?.trim()
          ? formData.data_matrimonio.trim()
          : null,
      };

      if (editingPersona) {
        await axios.put(`${API}/persone/${editingPersona._id || editingPersona.id}`, payload);
      } else {
        await axios.post(`${API}/persone`, payload);
      }
      setIsDialogOpen(false);
      setEditingPersona(null);
      resetForm();
      loadPersone();
      loadStats();
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setPersonaToDelete(id);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (personaToDelete) {
      try {
        await axios.delete(`${API}/persone/${personaToDelete}`);
        loadPersone();
        loadStats();
        setIsConfirmDialogOpen(false);
        setPersonaToDelete(null);
      } catch (error) {
        console.error("Errore nell'eliminazione:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      anno: undefined,
      nome: "",
      cognome: "",
      padre: "",
      data_decesso: "",
      luogo_decesso: "",
      nascita: "",
      luogo_nascita: "",
      eta: "",
      data_matrimonio: "",
      nome_madre: "",
      cognome_madre: "",
      nome_coniuge: "",
      cognome_coniuge: "",
      registro: "",
      visibile: true,
      mostra_coniuge: true,
      note: ""
    });
  };

  const handleAdvancedSearch = () => {
    setCurrentPage(1);
    loadPersone();
  };

  const clearAdvancedSearch = () => {
    setAdvancedSearch({
      nome: "",
      cognome: "",
      padre: "",
      nome_madre: "",
      cognome_madre: "",
      nome_coniuge: "",
      cognome_coniuge: "",
      anno_nascita: "",
      anno_decesso: ""
    });
    setCurrentPage(1);
    setTimeout(loadPersone, 100);
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post(`${API}/persone/import-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert(`Import completato! ${response.data.imported} persone importate, ${response.data.skipped} saltate.`);
      loadPersone();
      loadStats();
    } catch (error) {
      console.error('Errore durante l\'import:', error);
      alert('Errore durante l\'import del file Excel');
    } finally {
      setLoading(false);
      // Reset input file
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header - Mobile First Design */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout (Stack Verticale) */}
          <div className="block md:hidden">
            <div className="text-center space-y-4">
              {/* Loghi affiancati sopra */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <img 
                    src="/cropped-caiazzo-stemma-250.png" 
                    alt="Stemma Caiazzo" 
                    className="w-14 h-14 object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-600 mt-1">Città di Caiazzo</p>
                </div>
                <div className="text-center">
                  <img 
                    src="/Logo-Italea-blu.svg" 
                    alt="Logo Italea" 
                    className="w-14 h-14 object-contain mx-auto"
                  />
                  <p className="text-xs text-gray-600 mt-1">Il viaggio verso le tue radici</p>
                </div>
              </div>
              {/* Titolo principale sotto */}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Radici - Archivio e Memorie</p>
              </div>
            </div>
          </div>

          {/* Desktop Layout (Orizzontale) */}
          <div className="hidden md:flex items-center justify-between">
            <div className="text-center">
              <img 
                src="/cropped-caiazzo-stemma-250.png" 
                alt="Stemma Caiazzo" 
                className="w-16 h-16 object-contain mx-auto"
              />
              <p className="text-xs text-gray-600 mt-1">Città di Caiazzo</p>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600 mt-1">Radici - Archivio e Memorie</p>
            </div>
            <div className="text-center">
              <img 
                src="/Logo-Italea-blu.svg" 
                alt="Logo Italea" 
                className="w-16 h-16 object-contain mx-auto"
              />
              <p className="text-xs text-gray-600 mt-[-15px]">Il viaggio verso le tue radici</p>
            </div>
          </div>
          
          {/* Sezione pulsanti - Responsive */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Mobile Layout - Stack Verticale */}
            <div className="block md:hidden space-y-3">
              {/* Pulsante Aggiungi Persona - Prima su mobile */}
              <div className="flex justify-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingPersona(null);
                        resetForm();
                      }}
                      className="bg-black hover:bg-stone-900 text-white w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Persona
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
              
              {/* Pulsanti di controllo - Sotto su mobile */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMaintenanceMode}
                  className={`flex items-center gap-2 text-xs ${
                    maintenanceMode 
                      ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' 
                      : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                  {maintenanceMode ? 'Disattiva Manutenzione' : 'Attiva Manutenzione'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/admin' })}
                  className="bg-white hover:bg-red-100 text-red-700 border-red-100 flex items-center gap-2 text-xs"
                >
                  <LogOut className="w-3 h-3" />
                  Esci
                </Button>
              </div>
            </div>

            {/* Desktop Layout - Orizzontale */}
            <div className="hidden md:block relative">
              {/* Pulsanti a sinistra */}
              <div className="absolute left-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMaintenanceMode}
                  className={`flex items-center gap-2 text-xs ${
                    maintenanceMode 
                      ? 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200' 
                      : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                  {maintenanceMode ? 'Disattiva Manutenzione' : 'Attiva Manutenzione'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/admin' })}
                  className="bg-white hover:bg-red-100 text-red-700 border-red-100 flex items-center gap-2 text-xs"
                >
                  <LogOut className="w-3 h-3" />
                  Esci
                </Button>
              </div>
              
              {/* Pulsante Aggiungi Persona centrato */}
              <div className="flex justify-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setEditingPersona(null);
                        resetForm();
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Persona
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Dialog Aggiungi/Modifica Persona */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPersona ? "Radici - Modifica Persona" : "Radici - Aggiungi Persona"}
                    </DialogTitle>
                    <DialogDescription>
                      Inserisci le informazioni della persona nel registro storico
                    </DialogDescription>
                  </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cognome">Cognome *</Label>
                      <Input
                        id="cognome"
                        value={formData.cognome}
                        onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nascita">Data/Anno di Nascita</Label>
                      <Input
                        id="nascita"
                        value={formData.nascita}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({...formData, nascita: value});
                        }}
                        placeholder="1780 o 15/3/80"
                        className={!validateDateFormat(formData.nascita) ? "border-red-500" : ""}
                      />
                      <p className="text-xs text-gray-500 mt-1">Anno o data completa</p>
                    </div>
                    <div>
                      <Label htmlFor="data_decesso">Data/Anno di Decesso</Label>
                      <Input
                        id="data_decesso"
                        value={formData.data_decesso}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({...formData, data_decesso: value});
                        }}
                        placeholder="1809 o 3/1/09"
                        className={!validateDateFormat(formData.data_decesso) ? "border-red-500" : ""}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Anno o data completa</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="luogo_nascita">Luogo di Nascita</Label>
                      <Input
                        id="luogo_nascita"
                        value={formData.luogo_nascita}
                        onChange={(e) => setFormData({...formData, luogo_nascita: e.target.value})}
                        placeholder="Città o paese"
                      />
                    </div>
                    <div>
                      <Label htmlFor="luogo_decesso">Luogo di Decesso</Label>
                      <Input
                        id="luogo_decesso"
                        value={formData.luogo_decesso}
                        onChange={(e) => setFormData({...formData, luogo_decesso: e.target.value})}
                        placeholder="Città o paese"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="padre">Nome del Padre</Label>
                    <Input
                      id="padre"
                      value={formData.padre}
                      onChange={(e) => setFormData({...formData, padre: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_madre">Nome della Madre</Label>
                      <Input
                        id="nome_madre"
                        value={formData.nome_madre}
                        onChange={(e) => setFormData({...formData, nome_madre: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cognome_madre">Cognome della Madre</Label>
                      <Input
                        id="cognome_madre"
                        value={formData.cognome_madre}
                        onChange={(e) => setFormData({...formData, cognome_madre: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome_coniuge">Nome del Coniuge</Label>
                      <Input
                        id="nome_coniuge"
                        value={formData.nome_coniuge}
                        onChange={(e) => setFormData({...formData, nome_coniuge: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cognome_coniuge">Cognome del Coniuge</Label>
                      <Input
                        id="cognome_coniuge"
                        value={formData.cognome_coniuge}
                        onChange={(e) => setFormData({...formData, cognome_coniuge: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="data_matrimonio">Data di matrimonio (opzionale)</Label>
                    <Input
                      id="data_matrimonio"
                      value={formData.data_matrimonio ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, data_matrimonio: value });
                      }}
                      placeholder="es. 1798 o 12/06/1798"
                      className={
                        formData.data_matrimonio && !validateDateFormat(formData.data_matrimonio)
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formData.data_matrimonio && !validateDateFormat(formData.data_matrimonio) && (
                      <p className="text-xs text-red-500 mt-1">
                        Formato non valido. Usa anno (es. 1798) o giorno/mese/anno (es. 12/06/1798).
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="registro">Registro / Numero di riferimento</Label>
                    <Input
                      id="registro"
                      value={formData.registro}
                      onChange={(e) => setFormData({...formData, registro: e.target.value})}
                      placeholder="Es. Registro 12, Pag. 45"
                    />
                  </div>

                  {/* Controllo Visibilità */}
                  <div className="border-t pt-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="visibile"
                        checked={formData.visibile}
                        onChange={(e) => setFormData({...formData, visibile: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div>
                        <Label htmlFor="visibile" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Visibile al pubblico
                        </Label>
                        <p className="text-xs text-gray-500">
                          Se attivato, questa persona sarà visibile nella ricerca pubblica
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="mostra_coniuge"
                        checked={formData.mostra_coniuge}
                        onChange={(e) => setFormData({...formData, mostra_coniuge: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div>
                        <Label htmlFor="mostra_coniuge" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Mostra informazioni coniuge
                        </Label>
                        <p className="text-xs text-gray-500">
                          Se attivato, i campi coniuge e data matrimonio saranno visibili al pubblico
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-800">
                    {editingPersona ? 'Salva Modifiche' : 'Crea Persona'}
                  </Button>
                </form>
              </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiche con colori originali ma testo leggibile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Totale Persone</CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalPersone}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Con Padre</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.personeWithPadre}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Con Madre</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.personeWithMadre}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Con Coniuge</CardTitle>
              <span className="text-lg leading-none">⚭</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.personeWithConiuge}</div>
            </CardContent>
          </Card>
        </div>

        {/* Sezione Ricerca */}
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ricerca persone nell'archivio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'semplice' | 'avanzata')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 gap-2">
                <TabsTrigger
                  value="semplice"
                  className="border border-transparent data-[state=active]:border-gray-800 data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-700 transition-colors data-[state=inactive]:hover:bg-gray-600 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:border-gray-600"
                >
                  Ricerca Semplice
                </TabsTrigger>
                <TabsTrigger
                  value="avanzata"
                  className="border border-transparent data-[state=active]:border-gray-800 data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-700 transition-colors data-[state=inactive]:hover:bg-gray-600 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:border-gray-600"
                >
                  Ricerca Avanzata
                </TabsTrigger>
              </TabsList>

              <TabsContent value="semplice" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Cerca per nome, cognome, padre, madre o coniuge..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 text-base"
                    />
                  </div>
                  <Button
                    onClick={loadPersone}
                    variant="outline"
                    className="h-12 px-6 w-full sm:w-auto border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Cerca
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="avanzata" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome"
                    value={advancedSearch.nome}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, nome: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome"
                    value={advancedSearch.cognome}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, cognome: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Padre"
                    value={advancedSearch.padre}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, padre: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Madre"
                    value={advancedSearch.nome_madre}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, nome_madre: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome Madre"
                    value={advancedSearch.cognome_madre}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, cognome_madre: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Coniuge"
                    value={advancedSearch.nome_coniuge}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, nome_coniuge: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome Coniuge"
                    value={advancedSearch.cognome_coniuge}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, cognome_coniuge: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Anno Nascita"
                    value={advancedSearch.anno_nascita}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, anno_nascita: e.target.value })}
                    className="h-11"
                  />
                  <Input
                    placeholder="Anno Decesso"
                    value={advancedSearch.anno_decesso}
                    onChange={(e) => setAdvancedSearch({ ...advancedSearch, anno_decesso: e.target.value })}
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <Button
                    onClick={handleAdvancedSearch}
                    variant="outline"
                    className="h-11 px-4 border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Ricerca Avanzata
                  </Button>
                  <Button
                    onClick={clearAdvancedSearch}
                    variant="outline"
                    className="h-11 px-4 border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Pulisci Filtri
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tabella Risultati - Stile Originale */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <span>Risultati della Ricerca</span>
              <Badge variant="secondary" className="text-sm">
                {totalPersone} persone trovate
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-600">
              Mostra 5 risultati per pagina - Clicca su una persona per vedere tutti i dettagli
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Caricamento risultati...</p>
              </div>
            ) : persone.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Nessun risultato trovato</p>
                <p className="text-gray-500 text-sm">Prova a modificare i termini di ricerca</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View - Admin */}
                <div className="block md:hidden space-y-4">
                  {persone.map((persona) => (
                    <Card 
                      key={persona._id || persona.id || `${persona.nome}-${persona.cognome}`}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-black"
                      onClick={() => {
                        setSelectedPersona(persona);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {persona.nome} {persona.cognome}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <p className="text-sm text-gray-600">
                                Nascita: {persona.nascita || "N.d."}
                              </p>
                              <Badge 
                                variant={persona.visibile ? "default" : "secondary"}
                                className={`text-xs ${
                                  persona.visibile 
                                    ? "bg-green-100 text-green-800 border-green-200" 
                                    : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}
                              >
                                {persona.visibile ? "Visibile" : "Nascosto"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-10 w-10 p-0 hover:bg-blue-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPersona(persona);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View - Admin */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="enhanced-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/4">Nome</TableHead>
                        <TableHead className="w-1/4">Cognome</TableHead>
                        <TableHead className="w-1/4">Nascita</TableHead>
                        <TableHead className="w-20">Visibilità</TableHead>
                        <TableHead className="w-24">Dettagli</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {persone.map((persona) => (
                        <TableRow 
                          key={persona._id || persona.id || `${persona.nome}-${persona.cognome}`} 
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSelectedPersona(persona);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <TableCell className="font-medium text-gray-900">
                            {persona.nome}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {persona.cognome}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-gray-200 text-gray-800 border-gray-300">
                              {persona.nascita || "N.d."}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              persona.visibile 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {persona.visibile ? 'Pubblico' : '🔒 Privato'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPersona(persona);
                                setIsDetailDialogOpen(true);
                              }}
                              className="text-gray-700 hover:text-white hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginazione Admin - Responsive */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t space-y-4">
                    {/* Info paginazione - Sempre visibile e centrata su mobile */}
                    <div className="text-center">
                      <div className="text-sm text-gray-600 font-medium">
                        Pagina {currentPage} di {totalPages}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {totalPersone} risultati totali
                      </div>
                    </div>
                    
                    {/* Controlli paginazione */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {/* Pulsante Precedente */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage === 1) return;
                          setCurrentPage(currentPage - 1);
                          clearNavButtonState();
                        }}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-2 w-full sm:w-auto h-10 border transition-colors ${
                          activeNavButton === 'prev'
                            ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-800'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-600 disabled:opacity-50'
                        }`}
                        onMouseDown={() => handleNavButtonPress('prev')}
                        onMouseUp={clearNavButtonState}
                        onMouseLeave={clearNavButtonState}
                        onTouchStart={() => handleNavButtonPress('prev')}
                        onTouchEnd={clearNavButtonState}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            handleNavButtonPress('prev');
                          }
                        }}
                        onKeyUp={clearNavButtonState}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Precedente
                      </Button>
                      
                      {/* Numeri pagina - Solo su desktop */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + Math.min(i, 4);
                          if (pageNum <= totalPages && pageNum >= 1) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 p-0 ${
                                  currentPage === pageNum 
                                    ? "bg-gray-800 text-white border-gray-800 hover:bg-gray-800" 
                                    : "text-gray-700 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-600"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      {/* Input diretto pagina - Solo su mobile */}
                      <div className="flex sm:hidden items-center gap-2">
                        <span className="text-sm text-gray-600">Vai a:</span>
                        <input
                          type="number"
                          min="1"
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                              setCurrentPage(page);
                            }
                          }}
                          className="w-16 h-8 text-center border border-gray-300 rounded text-sm"
                        />
                      </div>
                      
                      {/* Pulsante Successiva */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage === totalPages) return;
                          setCurrentPage(currentPage + 1);
                          clearNavButtonState();
                        }}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-2 w-full sm:w-auto h-10 border transition-colors ${
                          activeNavButton === 'next'
                            ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-800'
                            : 'text-gray-700 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-600 disabled:opacity-50'
                        }`}
                        onMouseDown={() => handleNavButtonPress('next')}
                        onMouseUp={clearNavButtonState}
                        onMouseLeave={clearNavButtonState}
                        onTouchStart={() => handleNavButtonPress('next')}
                        onTouchEnd={clearNavButtonState}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            handleNavButtonPress('next');
                          }
                        }}
                        onKeyUp={clearNavButtonState}
                      >
                        Successiva
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog dettagli persona - Stile Originale */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl custom-scroll">
          <DialogHeader className="pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center sm:items-center text-center">
                <img 
                  src="/cropped-caiazzo-stemma-250.png" 
                  alt="Stemma Comune di Caiazzo" 
                  className="w-16 h-16 object-contain"
                />
                <p className="text-sm font-medium text-gray-600 mt-1">Città di Caiazzo</p>
              </div>
              <DialogTitle className="w-full text-center text-lg sm:text-xl font-semibold text-gray-900 px-2 whitespace-nowrap">
                Scheda - {selectedPersona?.nome} {selectedPersona?.cognome}
              </DialogTitle>
              <div className="hidden sm:block" />
            </div>
            <div className="mt-2 flex justify-center sm:justify-center">
              <span className={`inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium ${
                selectedPersona?.visibile 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedPersona?.visibile ? 'Visibile al pubblico' : '🔒 Solo admin'}
              </span>
            </div>
          </DialogHeader>
          
          {selectedPersona && (
            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
              {/* Informazioni Personali */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informazioni Personali
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome - Cognome</Label>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPersona.nome} {selectedPersona.cognome}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Data di decesso */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Data di decesso</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.data_decesso || "N.d."}
                      </span>
                    </div>

                    {/* Luogo di decesso */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Luogo di decesso</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.luogo_decesso || "N.d."}
                      </span>
                    </div>

                    {/* Data di nascita */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Data di nascita</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.nascita || "N.d."}
                      </span>
                    </div>

                    {/* Luogo di nascita */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Luogo di nascita</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.luogo_nascita || "N.d."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informazioni Familiari */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informazioni Familiari
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Padre */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Padre
                      </Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.padre || "N.d."}
                      </span>
                    </div>

                    {/* Madre */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Madre
                      </Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.nome_madre || selectedPersona.cognome_madre 
                          ? `${selectedPersona.nome_madre || ""} ${selectedPersona.cognome_madre || ""}`.trim()
                          : "N.d."
                        }
                      </span>
                    </div>

                    {/* Coniuge */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 flex items-baseline gap-1">
                        <span className="text-lg leading-none">⚭</span>
                        Coniuge
                        {!selectedPersona.mostra_coniuge && (
                          <span className="text-xs text-red-600 ml-2">(nascosto al pubblico)</span>
                        )}
                      </Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.nome_coniuge || selectedPersona.cognome_coniuge 
                          ? `${selectedPersona.nome_coniuge || ""} ${selectedPersona.cognome_coniuge || ""}`.trim()
                          : "N.d."
                        }
                      </span>
                    </div>

                    {/* Data matrimonio */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 flex items-baseline gap-1">
                        Data di matrimonio
                        {!selectedPersona.mostra_coniuge && (
                          <span className="text-xs text-red-600 ml-2">(nascosto al pubblico)</span>
                        )}
                      </Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.data_matrimonio || "N.d."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Azioni - Responsive */}
              <div className="pt-4 border-t space-y-4">
                {/* Info IDs */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">
                    Registro: {formatRegistroDisplay(selectedPersona.anno, selectedPersona.registro)}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Record ID: {selectedPersona._id || selectedPersona.id || 'N/A'}
                  </div>
                </div>
                
                {/* Pulsanti - Stack su mobile, inline su desktop */}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setEditingPersona(selectedPersona);
                      setFormData({
                        anno: selectedPersona.anno,
                        nome: selectedPersona.nome,
                        cognome: selectedPersona.cognome,
                        padre: selectedPersona.padre || "",
                        data_decesso: selectedPersona.data_decesso,
                        luogo_decesso: selectedPersona.luogo_decesso || "",
                        nascita: selectedPersona.nascita || "",
                        luogo_nascita: selectedPersona.luogo_nascita || "",
                        eta: selectedPersona.eta || "",
                        data_matrimonio: selectedPersona.data_matrimonio || "",
                        nome_madre: selectedPersona.nome_madre || "",
                        cognome_madre: selectedPersona.cognome_madre || "",
                        nome_coniuge: selectedPersona.nome_coniuge || "",
                        cognome_coniuge: selectedPersona.cognome_coniuge || "",
                        registro: selectedPersona.registro || "",
                        visibile: selectedPersona.visibile,
                        mostra_coniuge: selectedPersona.mostra_coniuge,
                        note: selectedPersona.note || ""
                      });
                      setIsDialogOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                    Modifica
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleDelete(selectedPersona._id || selectedPersona.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Elimina
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog di Conferma Eliminazione */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Conferma Eliminazione
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Sei sicuro di voler eliminare questa persona? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setPersonaToDelete(null);
              }}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-black">
            <p>Città di Caiazzo Radici ©</p>
            <p className="text-sm text-black">
              Powered by{' '}
              <a 
                href="https://cmh.it/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
              >
                CMH
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}