'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Users, User, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { PersonaDefunta } from "@/types/persona";

const API = '/api';

export default function PublicView() {
  const [persone, setPersone] = useState<PersonaDefunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPersone, setTotalPersone] = useState(0);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaDefunta | null>(null);
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

  useEffect(() => {
    loadPersone();
  }, [currentPage, searchTerm]);

  const loadPersone = async () => {
    setLoading(true);
    try {
      const params = {
        pagina: currentPage,
        per_pagina: 5,
        ...(searchTerm && { ricerca: searchTerm }),
        ...Object.entries(advancedSearch).reduce((acc, [key, value]) => {
          if (value.trim()) acc[key] = value.trim();
          return acc;
        }, {} as Record<string, string>)
      };

      const response = await axios.get(`${API}/persone`, { params });
      setPersone(response.data.persone);
      setTotalPages(response.data.totale_pagine);
      setTotalPersone(response.data.totale);
    } catch (error) {
      console.error("Errore nel caricamento delle persone:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (persona: PersonaDefunta) => {
    setSelectedPersona(persona);
    setIsDetailDialogOpen(true);
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
              <h1 className="text-3xl font-bold text-gray-900">Radici</h1>
              <p className="text-gray-600">Archivio e Memorie dei Defunti</p>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ricerca Persone
            </CardTitle>
            <CardDescription>
            Cerca nel registro storico dei defunti
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
          <DialogHeader className="text-center">
            <div className="flex flex-col items-center gap-4 mb-4">
              <img 
                src="/cropped-caiazzo-stemma-250.png" 
                alt="Stemma Comune di Caiazzo" 
                className="w-16 h-16 object-contain"
              />
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Scheda - {selectedPersona?.nome} {selectedPersona?.cognome}
              </DialogTitle>
            </div>
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
                    <Label className="text-sm font-medium text-gray-600">Nome - Cognome</Label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPersona.nome} {selectedPersona.cognome}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Date e Luoghi</Label>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {/* Data di Decesso */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Decesso:</span>
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
                          {selectedPersona.data_decesso || "Non specificata"}
                        </span>
                      </div>
                      
                      {/* Luogo Decesso */}
                      {selectedPersona.luogo_decesso && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">in</span>
                          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
                            {selectedPersona.luogo_decesso}
                          </span>
                        </div>
                      )}
                      
                      {/* Divisore */}
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      
                      {/* Data di Nascita */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Nascita:</span>
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                          {selectedPersona.nascita || "Non specificata"}
                        </span>
                      </div>
                      
                      {/* Luogo Nascita */}
                      {selectedPersona.luogo_nascita && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">in</span>
                          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                            {selectedPersona.luogo_nascita}
                          </span>
                        </div>
                      )}
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
                    <Label className="text-sm font-medium text-gray-600 flex items-baseline gap-1">
                      <span className="text-lg leading-none">⚭</span>
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

              {/* Registro ID e Record ID */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-xs text-gray-500">
                  Registro ID: {selectedPersona.registro || "Non specificato"}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  Record ID: {selectedPersona.id}
                </div>
              </div>
            </div>
          )}
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
