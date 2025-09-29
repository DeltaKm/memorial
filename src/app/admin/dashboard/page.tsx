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

const API = "/api";

export default function Home() {
  const { data: session } = useSession();
  const [persone, setPersone] = useState<PersonaDefunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{totalPersone: number; personeWithPadre: number; personeWithMadre: number; personeWithConiuge: number}>({totalPersone: 0, personeWithPadre: 0, personeWithMadre: 0, personeWithConiuge: 0});
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
    nome_madre: "",
    cognome_madre: "",
    nome_coniuge: "",
    cognome_coniuge: "",
    registro: "",
    visibile: true,
    note: ""
  });

  const loadPersone = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        pagina: currentPage,
        per_pagina: 5,
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

  useEffect(() => {
    loadPersone();
    loadStats();
  }, [currentPage, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPersona) {
        await axios.put(`${API}/persone/${editingPersona._id || editingPersona.id}`, formData);
      } else {
        await axios.post(`${API}/persone`, formData);
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
      nome_madre: "",
      cognome_madre: "",
      nome_coniuge: "",
      cognome_coniuge: "",
      registro: "",
      visibile: true,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <img 
                src="/cropped-caiazzo-stemma-250.png" 
                alt="Stemma Caiazzo" 
                className="w-16 h-16 object-contain mx-auto"
              />
              <p className="text-xs text-gray-600 mt-1">Città di Caiazzo</p>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin - Radici</h1>
              <p className="text-gray-600 mt-1">Archivio e Memorie dei Defunti</p>
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
          
          {/* Buttons section below header */}
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: '/admin' })}
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Esci
            </Button>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingPersona(null);
                    resetForm();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Persona
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPersona ? "Modifica Persona" : "Aggiungi Nuova Persona"}
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
                        onChange={(e) => setFormData({...formData, nascita: e.target.value})}
                        placeholder="es. (1780) o 15/03/1780"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_decesso">Data/Anno di Decesso *</Label>
                      <Input
                        id="data_decesso"
                        value={formData.data_decesso}
                        onChange={(e) => setFormData({...formData, data_decesso: e.target.value})}
                        placeholder="es. 03/01/1809"
                        required
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

                  <Button type="submit" className="w-full">
                    {editingPersona ? "Aggiorna" : "Aggiungi"} Persona
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-medium text-gray-900">Ricerca Persone</h2>
            </div>
            <p className="text-sm text-gray-600">Cerca nel registro storico dei defunti</p>
          </div>
          
          <div className="p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('semplice')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'semplice'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ricerca Semplice
                </button>
                <button
                  onClick={() => setActiveTab('avanzata')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'avanzata'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ricerca Avanzata
                </button>
              </nav>
            </div>

            {activeTab === 'semplice' && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Cerca per nome, cognome, padre, madre o coniuge..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={loadPersone}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Cerca
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'avanzata' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={advancedSearch.nome}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Cognome"
                    value={advancedSearch.cognome}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Nome Padre"
                    value={advancedSearch.padre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, padre: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Nome Madre"
                    value={advancedSearch.nome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_madre: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Cognome Madre"
                    value={advancedSearch.cognome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_madre: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Nome Coniuge"
                    value={advancedSearch.nome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_coniuge: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Cognome Coniuge"
                    value={advancedSearch.cognome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_coniuge: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Anno Nascita"
                    value={advancedSearch.anno_nascita}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_nascita: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Anno Decesso"
                    value={advancedSearch.anno_decesso}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_decesso: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdvancedSearch}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Ricerca Avanzata
                  </button>
                  <button
                    onClick={clearAdvancedSearch}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Pulisci Filtri
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabella Risultati - Stile Originale */}
        <Card>
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
                <div className="overflow-x-auto">
                  <Table className="enhanced-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3">Nome</TableHead>
                        <TableHead className="w-1/3">Cognome</TableHead>
                        <TableHead className="w-1/3">Nascita</TableHead>
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
                            <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                              {persona.nascita || "Data sconosciuta"}
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
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginazione - Stile Originale con Numeri */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Pagina {currentPage} di {totalPages} ({totalPersone} risultati totali)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-700" />
                        Precedente
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {/* Mostra alcune pagine intorno a quella corrente */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + Math.min(i, 4);
                          if (pageNum <= totalPages && pageNum >= 1) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-8 h-8 p-0 ${
                                  currentPage === pageNum 
                                    ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" 
                                    : "text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Successiva
                        <ChevronRight className="w-4 h-4 text-gray-700" />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <User className="w-5 h-5" />
              Dettagli Completi - {selectedPersona?.nome} {selectedPersona?.cognome}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Informazioni complete dal registro storico del 1809
            </DialogDescription>
          </DialogHeader>
          
          {selectedPersona && (
            <div className="space-y-6">
              {/* Informazioni Personali */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informazioni Personali
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPersona.nome} {selectedPersona.cognome}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data di Nascita</Label>
                    <div className="text-lg text-gray-900 mt-1">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                        {selectedPersona.nascita || "Data sconosciuta"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data di Decesso</Label>
                    <div className="text-lg text-gray-900 mt-1">
                      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
                        {selectedPersona.data_decesso}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informazioni Familiari */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informazioni Familiari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Padre */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Padre
                    </Label>
                    <div className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.padre || "Informazione non disponibile"}
                    </div>
                  </div>
                  
                  {/* Madre */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Madre
                    </Label>
                    <div className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.nome_madre || selectedPersona.cognome_madre 
                        ? `${selectedPersona.nome_madre || ""} ${selectedPersona.cognome_madre || ""}`.trim()
                        : "Informazione non disponibile"
                      }
                    </div>
                  </div>
                  
                  {/* Coniuge */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-baseline gap-1">
                      <span className="text-lg leading-none">⚭</span>
                      Coniuge
                    </Label>
                    <div className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.nome_coniuge || selectedPersona.cognome_coniuge 
                        ? `${selectedPersona.nome_coniuge || ""} ${selectedPersona.cognome_coniuge || ""}`.trim()
                        : "Informazione non disponibile"
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">
                    Registro ID: {selectedPersona.registro || "Non specificato"}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Record ID: {selectedPersona._id || selectedPersona.id || 'N/A'}
                  </div>
                </div>
                <div className="flex gap-2">
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
                        nome_madre: selectedPersona.nome_madre || "",
                        cognome_madre: selectedPersona.cognome_madre || "",
                        nome_coniuge: selectedPersona.nome_coniuge || "",
                        cognome_coniuge: selectedPersona.cognome_coniuge || "",
                        registro: selectedPersona.registro || "",
                        visibile: selectedPersona.visibile,
                        note: selectedPersona.note || ""
                      });
                      setIsDialogOpen(true);
                    }}
                    className="flex items-center gap-2"
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
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
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
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center text-gray-600">
            <p>Città di Caiazzo Radici ©</p>
            <p className="text-sm text-gray-400">Powered by CMH</p>
          </div>
        </div>
      </footer>
    </div>
  );
}