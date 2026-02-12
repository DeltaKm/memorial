'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { formatRegistroDisplay } from "@/lib/utils";

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
  const [activeNavButton, setActiveNavButton] = useState<'prev' | 'next' | null>(null);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSecurityWarning = useCallback((message: string) => {
    setSecurityWarning(message);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    warningTimeoutRef.current = setTimeout(() => {
      setSecurityWarning(null);
    }, 3000);
  }, []);

  useEffect(() => {
    loadPersone();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      showSecurityWarning('Copia tramite tasto destro non consentita su questa pagina.');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (
        isCtrlOrMeta &&
        (['c', 'x', 's', 'p', 'u'].includes(key) ||
          (event.shiftKey && ['i', 'j', 'c'].includes(key)))
      ) {
        event.preventDefault();
        showSecurityWarning('Combinazione di tasti disabilitata: il contenuto non può essere copiato o salvato.');
      }

      if (event.key === 'PrintScreen' || key === 'f12') {
        showSecurityWarning('Cattura schermo disabilitata: il contenuto è protetto.');
        try {
          void navigator.clipboard?.writeText('');
        } catch (error) {
          // ignore clipboard errors (permissions / unsupported)
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown, { capture: true } as EventListenerOptions);
    };
  }, [showSecurityWarning]);

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  const handleClipboardEvent = (event: React.ClipboardEvent) => {
    event.preventDefault();
    showSecurityWarning('Copia/Incolla disabilitati: il contenuto è protetto su questa pagina.');
  };

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

  const handleNavButtonPress = (type: 'prev' | 'next') => setActiveNavButton(type);
  const clearNavButtonState = () => setActiveNavButton(null);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100"
      onContextMenu={(event) => {
        event.preventDefault();
        showSecurityWarning('Copia tramite tasto destro non consentita su questa pagina.');
      }}
      onCopy={handleClipboardEvent}
      onCut={handleClipboardEvent}
      onPaste={handleClipboardEvent}
    >
      {securityWarning && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[45] flex justify-center">
          <div className="rounded-md bg-black/85 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm">
            {securityWarning}
          </div>
        </div>
      )}
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
                <h1 className="text-2xl font-bold text-gray-900">Radici</h1>
                <p className="text-sm text-gray-600">Archivio e Memorie</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Radici</h1>
              <p className="text-gray-600">Archivio e Memorie</p>
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
        <Card className="mb-6 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Ricerca persone nell'archivio
            </CardTitle>

          </CardHeader>
          <CardContent>
            <Tabs defaultValue="semplice" className="w-full">
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
                    className="h-12 px-6 w-full sm:w-auto border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Cerca
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="avanzata" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nome"
                    value={advancedSearch.nome}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome"
                    value={advancedSearch.cognome}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Padre"
                    value={advancedSearch.padre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, padre: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Madre"
                    value={advancedSearch.nome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_madre: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome Madre"
                    value={advancedSearch.cognome_madre}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_madre: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Nome Coniuge"
                    value={advancedSearch.nome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, nome_coniuge: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Cognome Coniuge"
                    value={advancedSearch.cognome_coniuge}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, cognome_coniuge: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Anno Nascita"
                    value={advancedSearch.anno_nascita}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_nascita: e.target.value})}
                    className="h-11"
                  />
                  <Input
                    placeholder="Anno Decesso"
                    value={advancedSearch.anno_decesso}
                    onChange={(e) => setAdvancedSearch({...advancedSearch, anno_decesso: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <Button 
                    onClick={handleAdvancedSearch}
                    variant="outline"
                    className="h-11 w-full sm:w-auto border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Ricerca Avanzata
                  </Button>
                  <Button 
                    onClick={clearAdvancedSearch} 
                    variant="outline"
                    className="h-11 w-full sm:w-auto border border-gray-300 text-gray-700 transition-colors hover:bg-gray-700 hover:text-white hover:border-gray-700"
                  >
                    Pulisci Filtri
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="select-none border border-gray-200 shadow-sm">
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
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {persone.map((persona) => (
                    <Card 
                      key={persona.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-black"
                      onClick={() => handleViewDetails(persona)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {persona.nome} {persona.cognome}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Nascita: {persona.nascita || "N.d."}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-10 w-10 p-0 hover:bg-blue-100 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(persona);
                            }}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
                            <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-gray-200 text-gray-800 border-gray-300">
                              {persona.nascita || "N.d."}
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

                {/* Pagination - Responsive */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-4 border-t space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 font-medium">
                        Pagina {currentPage} di {totalPages}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {totalPersone} risultati totali
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
                            ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-800 hover:text-white'
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
                                    ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-800'
                                    : 'text-gray-700 border-gray-300 hover:bg-gray-600 hover:text-white hover:border-gray-600'
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          return null;
                        })}
                      </div>

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
                            ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-800 hover:text-white'
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

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto select-none rounded-2xl custom-scroll">
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
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPersona.nome} {selectedPersona.cognome}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Data decesso */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Data di decesso</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.data_decesso || "N.d."}
                      </span>
                    </div>

                    {/* Luogo decesso */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Luogo di decesso</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.luogo_decesso || "N.d."}
                      </span>
                    </div>

                    {/* Data nascita */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-600 block">Data di nascita</Label>
                      <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                        {selectedPersona.nascita || "N.d."}
                      </span>
                    </div>

                    {/* Luogo nascita */}
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

                    {/* Coniuge - mostrato solo se mostra_coniuge è true */}
                    {selectedPersona.mostra_coniuge && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600 flex items-baseline gap-1">
                          <span className="text-lg leading-none">⚭</span>
                          Coniuge
                        </Label>
                        <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                          {selectedPersona.nome_coniuge || selectedPersona.cognome_coniuge 
                            ? `${selectedPersona.nome_coniuge || ""} ${selectedPersona.cognome_coniuge || ""}`.trim()
                            : "N.d."
                          }
                        </span>
                      </div>
                    )}

                    {/* Data matrimonio - mostrato solo se mostra_coniuge è true */}
                    {selectedPersona.mostra_coniuge && (
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-600 block">Data di matrimonio</Label>
                        <span className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-800 border-gray-300">
                          {selectedPersona.data_matrimonio || "N.d."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Registro ID e Record ID */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-xs text-gray-500">
                  Registro: {formatRegistroDisplay(selectedPersona.anno, selectedPersona.registro)}
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
