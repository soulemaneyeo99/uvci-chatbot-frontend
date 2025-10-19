'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  ArrowLeft, 
  FileText, 
  Upload, 
  Database,
  BarChart3,
  Users,
  MessageSquare,
  GraduationCap,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'stats'>('overview');

  const stats = [
    { icon: MessageSquare, label: 'Conversations', value: '245', color: 'text-blue-600' },
    { icon: Users, label: 'Utilisateurs', value: '89', color: 'text-green-600' },
    { icon: FileText, label: 'Documents', value: '12', color: 'text-orange-600' },
    { icon: Database, label: 'Base de données', value: 'Active', color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="btn btn-secondary text-sm">
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Retour</span>
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <Settings className="text-uvci-purple" size={24} />
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Administration
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-uvci-purple to-uvci-purpleLight text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} />
              Vue d'ensemble
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'documents'
                ? 'bg-gradient-to-r from-uvci-purple to-uvci-purpleLight text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={18} />
              Documents
            </span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-uvci-purple to-uvci-purpleLight text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Database size={18} />
              Statistiques
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                  <stat.icon className={`${stat.color} mb-3`} size={32} strokeWidth={2} />
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Info className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Panneau d'administration UVCI
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    Gérez les documents pédagogiques, consultez les statistiques d'utilisation et administrez le chatbot UVCI.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-purple-50 text-uvci-purple rounded-full font-medium">
                      Backend: Render
                    </span>
                    <span className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
                      Frontend: Vercel
                    </span>
                    <span className="text-xs px-3 py-1 bg-orange-50 text-orange-700 rounded-full font-medium">
                      IA: Gemini 2.5 Flash
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            {/* Upload Section */}
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="text-uvci-purple" size={24} />
                <h2 className="text-xl font-bold text-gray-900">
                  Gestion des documents
                </h2>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-uvci-purple transition-colors cursor-pointer">
                <Upload className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-600 font-medium mb-2">
                  Glissez-déposez vos documents PDF ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  ou cliquez pour parcourir
                </p>
                <button className="btn btn-primary">
                  <Upload size={18} />
                  Sélectionner des fichiers
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Les documents uploadés enrichiront la base de connaissances du chatbot. Formats acceptés : PDF uniquement.
                  </span>
                </p>
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Documents actuels</h3>
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                <p>Aucun document uploadé pour le moment</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-uvci-purple" size={24} />
              <h2 className="text-xl font-bold text-gray-900">
                Statistiques détaillées
              </h2>
            </div>
            
            <div className="text-center py-16 text-gray-500">
              <BarChart3 className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="font-medium mb-2">Statistiques en cours de développement</p>
              <p className="text-sm">Les analytics seront disponibles prochainement</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
