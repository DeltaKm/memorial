"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Users, Calendar, Heart, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { PersonaDefunta, PersonaDefuntaCreate, SearchResponse } from "@/types/persona";

const API = "/api";

export default function Home() {
  const [persone, setPersone] = useState<PersonaDefunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{totalPersone: number; personeWith1809: number; personeWithPadre: number; personeWithMadre: number; personeWithConiuge: number}>({totalPersone: 0, personeWith1809: 0, personeWithPadre: 0, personeWithMadre: 0, personeWithConiuge: 0});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPersone, setTotalPersone] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDefunta | null>(null);
  const [editingPersona, setEditingPersona] = useState<PersonaDefunta | null>(null);
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
    nome: "",
    cognome: "",
    decesso: "",
    nascita: "",
    padre: "",
    nome_madre: "",
    cognome_madre: "",
    nome_coniuge: "",
    cognome_coniuge: ""
  });

  const importExcelData = async () => {
    try {
      await axios.post(`${API}/persone/import-excel`);
    } catch (error) {
      console.log("Import data:", (error as Error & {response?: {data?: {message?: string}}}).response?.data?.message || "Dati già importati");
    }
  };

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

  useEffect(() => {
    loadPersone();
    loadStats();
    importExcelData();
  }, [currentPage, searchTerm]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/persone/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Errore nel caricamento delle statistiche:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPersona) {
        await axios.put(`${API}/persone/${editingPersona.id}`, formData);
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

  const handleViewDetails = (persona: PersonaDefunta) => {
    setSelectedPersona(persona);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (persona: PersonaDefunta) => {
    setEditingPersona(persona);
    setFormData({
      nome: persona.nome || "",
      cognome: persona.cognome || "",
      decesso: persona.decesso || "",
      nascita: persona.nascita || "",
      padre: persona.padre || "",
      nome_madre: persona.nome_madre || "",
      cognome_madre: persona.cognome_madre || "",
      nome_coniuge: persona.nome_coniuge || "",
      cognome_coniuge: persona.cognome_coniuge || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa persona?")) {
      try {
        await axios.delete(`${API}/persone/${id}`);
        loadPersone();
        loadStats();
      } catch (error) {
        console.error("Errore nell'eliminazione:", error);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      try {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${API}/persone/import-excel`, formData);
        loadPersone();
        loadStats();
      } catch (error) {
        console.error("Errore nel caricamento del file:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cognome: "",
      decesso: "",
      nascita: "",
      padre: "",
      nome_madre: "",
      cognome_madre: "",
      nome_coniuge: "",
      cognome_coniuge: ""
    });
  };

  const handleAdvancedSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Memoria Tabella 1809</h1>
              <p className="text-gray-600 mt-1">Sistema di gestione del registro storico dei defunti</p>
            </div>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      <Label htmlFor="decesso">Data/Anno di Decesso *</Label>
                      <Input
                        id="decesso"
                        value={formData.decesso}
                        onChange={(e) => setFormData({...formData, decesso: e.target.value})}
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Persone</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="">{stats.totalPersone || 0}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Decessi 1809</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="">{stats.personeWith1809 || 0}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Coniuge</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="">{stats.personeWithConiuge || 0}</Badge>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Info Genitori</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="">{stats.personeWithPadre || 0}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ricerca Persone
            </CardTitle>
            <CardDescription>
              Cerca nel registro storico dei defunti del 1809
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="semplice" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="semplice">Ricerca Semplice</TabsTrigger>
                <TabsTrigger value="avanzata">Ricerca Avanzata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="semplice" className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Cerca per nome, cognome, padre, madre o coniuge..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={loadPersone} variant="outline">
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
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome: e.target.value})}
                  />
                  <Input
                    placeholder="Cognome"
                    value={advancedSearch.cognome}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome: e.target.value})}
                  />
                  <Input
                    placeholder="Nome Padre"
                    value={advancedSearch.padre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, padre: e.target.value})}
                  />
                  <Input
                    placeholder="Nome Madre"
                    value={advancedSearch.nome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_madre: e.target.value})}
                  />
                  <Input
                    placeholder="Cognome Madre"
                    value={advancedSearch.cognome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_madre: e.target.value})}
                  />
                  <Input
                    placeholder="Nome Coniuge"
                    value={advancedSearch.nome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_coniuge: e.target.value})}
                  />
                  <Input
                    placeholder="Cognome Coniuge"
                    value={advancedSearch.cognome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_coniuge: e.target.value})}
                  />
                  <Input
                    placeholder="Anno Nascita"
                    value={advancedSearch.anno_nascita}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_nascita: e.target.value})}
                  />
                  <Input
                    placeholder="Anno Decesso"
                    value={advancedSearch.anno_decesso}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_decesso: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdvancedSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Ricerca Avanzata
                  </Button>
                  <Button onClick={clearAdvancedSearch} variant="outline">
                    Pulisci Filtri
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Risultati della Ricerca</span>
              <Badge variant="secondary" className="text-sm">
                {totalPersone} persone trovate
              </Badge>
            </CardTitle>
            <CardDescription>
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
                          key={persona.id} 
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => handleViewDetails(persona)}
                        >
                          <TableCell className="font-medium text-gray-900">
                            {persona.nome}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {persona.cognome}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {persona.nascita || "Data sconosciuta"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(persona);
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

                {/* Pagination */}
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
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Precedente
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4)) + Math.min(i, 4);
                          if (pageNum <= totalPages && pageNum >= 1) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="w-8 h-8 p-0"
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
                        className="flex items-center gap-1"
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

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dettagli Completi - {selectedPersona?.nome} {selectedPersona?.cognome}
            </DialogTitle>
            <DialogDescription>
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
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPersona.nome} {selectedPersona.cognome}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data di Nascita</Label>
                    <p className="text-lg text-gray-900 mt-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {selectedPersona.nascita || "Data sconosciuta"}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Data di Decesso</Label>
                    <p className="text-lg text-gray-900 mt-1">
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        {selectedPersona.decesso}
                      </Badge>
                    </p>
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
                    <p className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.padre || "Informazione non disponibile"}
                    </p>
                  </div>
                  
                  {/* Madre */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Madre
                    </Label>
                    <p className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.nome_madre || selectedPersona.cognome_madre 
                        ? `${selectedPersona.nome_madre || ""} ${selectedPersona.cognome_madre || ""}`.trim()
                        : "Informazione non disponibile"
                      }
                    </p>
                  </div>
                  
                  {/* Coniuge */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      Coniuge
                    </Label>
                    <p className="text-base text-gray-900 bg-white p-3 rounded border">
                      {selectedPersona.nome_coniuge || selectedPersona.cognome_coniuge 
                        ? `${selectedPersona.nome_coniuge || ""} ${selectedPersona.cognome_coniuge || ""}`.trim()
                        : "Informazione non disponibile"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Record ID: {selectedPersona.id}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      handleEdit(selectedPersona);
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
                      handleDelete(selectedPersona.id);
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

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>Sistema di Gestione Memoria Tabella 1809 - Registro Storico dei Defunti</p>
          </div>
        </div>
      </footer>
    </div>
  );
}