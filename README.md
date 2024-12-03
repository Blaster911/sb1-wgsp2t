## Configuration de l'envoi d'emails avec Firebase Functions

1. Installer Firebase CLI globalement :
```bash
npm install -g firebase-tools
```

2. Se connecter à Firebase :
```bash
firebase login
```

3. Initialiser le projet Firebase :
```bash
firebase init functions
```

4. Configurer les variables d'environnement Firebase :
```bash
firebase functions:config:set smtp.user="votre-email@gmail.com" smtp.pass="votre-mot-de-passe-app"
```

5. Déployer la fonction :
```bash
firebase deploy --only functions
```

### Configuration Gmail

1. Aller sur https://myaccount.google.com/security
2. Activer la validation en 2 étapes si ce n'est pas déjà fait
3. Dans "Mots de passe des applications" :
   - Sélectionner "Autre" comme nom d'application
   - Générer le mot de passe
   - Utiliser ce mot de passe pour SMTP_PASS

### Test de l'envoi d'emails

1. Vérifier que la Cloud Function est bien déployée dans la console Firebase
2. Vérifier les logs de la fonction après un envoi d'email
3. En cas d'erreur, vérifier :
   - Les permissions Gmail
   - Le mot de passe d'application
   - Les paramètres de configuration Firebase