import { publishUpdate } from '../src/utils/updateManager';

// Exemple d'utilisation:
async function main() {
  try {
    await publishUpdate({
      version: '1.1.0',
      mandatory: false,
      changes: [
        'Amélioration des performances',
        'Correction de bugs mineurs',
        'Nouvelles fonctionnalités ajoutées'
      ]
    });
    console.log('Mise à jour publiée avec succès!');
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

main();