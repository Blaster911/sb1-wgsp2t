import React from 'react';
import { 
  FileText, 
  FileCheck, 
  Ticket, 
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  Euro,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock4
} from 'lucide-react';
import { useStatistics } from '../hooks/useStatistics';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

function DashboardCard({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendValue,
  loading = false,
  gradientFrom,
  gradientTo
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  loading?: boolean;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-sm border border-white/10 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
      <div className="absolute inset-0 bg-white/90"></div>
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              {trendValue}
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            <span className="text-gray-400">Chargement...</span>
          </div>
        ) : (
          <p className="text-2xl font-bold">
            {typeof value === 'number' && title.includes('€') 
              ? value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
              : value}
          </p>
        )}
      </div>
    </div>
  );
}

function Dashboard() {
  const { activeTickets, totalTickets, totalAmount, loading, error } = useStatistics();

  const recentTickets = [
    { id: 1, client: "Martin Dupont", device: "MacBook Pro", status: "En cours", date: "2024-03-15" },
    { id: 2, client: "Sophie Martin", device: "iPhone 13", status: "En attente", date: "2024-03-14" },
    { id: 3, client: "Jean Dubois", device: "PC Portable Dell", status: "Terminé", date: "2024-03-13" },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 -mx-10 -mt-10 px-10 pt-10 pb-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-blue-100">Bienvenue sur votre espace de gestion</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'PPPP', { locale: fr })}</span>
          </div>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={Ticket}
          title="Tickets actifs"
          value={activeTickets}
          trend="up"
          trendValue="+12.5%"
          loading={loading}
          gradientFrom="from-purple-500"
          gradientTo="to-purple-600"
        />
        <DashboardCard
          icon={CheckCircle}
          title="Total tickets"
          value={totalTickets}
          loading={loading}
          gradientFrom="from-blue-500"
          gradientTo="to-blue-600"
        />
        <DashboardCard
          icon={Euro}
          title="Montant total €"
          value={totalAmount}
          trend="up"
          trendValue="+8.2%"
          loading={loading}
          gradientFrom="from-green-500"
          gradientTo="to-green-600"
        />
        <DashboardCard
          icon={Users}
          title="Nouveaux clients"
          value="15"
          trend="up"
          trendValue="+5.1%"
          gradientFrom="from-orange-500"
          gradientTo="to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'activité */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Activité récente
            </h2>
            <select className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Graphique d'activité
          </div>
        </div>

        {/* Tickets récents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock4 className="w-5 h-5 text-blue-500" />
              Tickets récents
            </h2>
          </div>
          <div className="divide-y">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="py-4 flex items-center justify-between group hover:bg-gray-50 -mx-6 px-6 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{ticket.client}</p>
                  <p className="text-sm text-gray-500">{ticket.device}</p>
                </div>
                <div className="text-right">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${ticket.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 
                      ticket.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'}
                  `}>
                    {ticket.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{ticket.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">Alertes</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">3 devis en attente de réponse depuis plus de 7 jours</p>
          </div>
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">2 factures impayées dépassent 30 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;