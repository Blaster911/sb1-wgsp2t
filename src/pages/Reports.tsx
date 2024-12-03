import React from 'react';
import { BarChart2, TrendingUp, PieChart, Download } from 'lucide-react';

function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
          <p className="text-gray-500">Analysez les performances de votre activité</p>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chiffre <boltAction type="file" filePath="src/pages/Reports.tsx"> d'affaires */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              Chiffre d'affaires
            </h2>
            <select className="border rounded-lg px-3 py-1 text-sm">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>Cette année</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Graphique du chiffre d'affaires
          </div>
        </div>

        {/* Répartition des services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-500" />
              Répartition des services
            </h2>
          </div>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Graphique de répartition
          </div>
        </div>

        {/* Statistiques des tickets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-gray-500" />
              Statistiques des tickets
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Temps moyen de résolution</p>
              <p className="text-2xl font-semibold mt-1">2.5 jours</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Taux de satisfaction</p>
              <p className="text-2xl font-semibold mt-1">94%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Tickets en cours</p>
              <p className="text-2xl font-semibold mt-1">12</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Tickets résolus ce mois</p>
              <p className="text-2xl font-semibold mt-1">45</p>
            </div>
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top clients</h2>
          <div className="space-y-4">
            {[
              { name: 'Martin Dupont', amount: 1249.99 },
              { name: 'Sophie Martin', amount: 989.50 },
              { name: 'Jean Dubois', amount: 750.00 },
            ].map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                    {index + 1}
                  </div>
                  <span className="ml-3 text-gray-900">{client.name}</span>
                </div>
                <span className="font-medium">
                  {client.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;