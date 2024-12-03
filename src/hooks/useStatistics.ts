import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Statistics {
  activeTickets: number;
  totalTickets: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

export function useStatistics() {
  const [stats, setStats] = useState<Statistics>({
    activeTickets: 0,
    totalTickets: 0,
    totalAmount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    async function fetchStatistics() {
      try {
        // Query pour les tickets actifs
        const activeTicketsQuery = query(
          collection(db, 'tickets'),
          or(
            where('status', '==', 'reception'),
            where('status', '==', 'diagnostic'),
            where('status', '==', 'waiting_client'),
            where('status', '==', 'waiting_parts')
          )
        );

        // Query pour tous les tickets
        const allTicketsQuery = query(collection(db, 'tickets'));

        // Exécuter les queries
        const [activeTicketsSnapshot, allTicketsSnapshot] = await Promise.all([
          getDocs(activeTicketsQuery),
          getDocs(allTicketsQuery)
        ]);

        // Calculer les statistiques
        const activeTicketsCount = activeTicketsSnapshot.size;
        const totalTicketsCount = allTicketsSnapshot.size;
        let totalAmount = 0;

        // Calculer le montant total
        allTicketsSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.totalAmount) {
            totalAmount += data.totalAmount;
          }
        });

        setStats({
          activeTickets: activeTicketsCount,
          totalTickets: totalTicketsCount,
          totalAmount: totalAmount,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des statistiques'
        }));
      }
    }

    fetchStatistics();
  }, []);

  return stats;
}