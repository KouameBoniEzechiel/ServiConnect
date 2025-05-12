#!/bin/bash

# Nom du projet (par défaut = "mon-projet")
PROJECT_NAME=${1:-mon-projet}

# Crée le dossier du projet
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME" || exit

echo "📁 Création de la structure..."

# Structure du projet
mkdir -p src/{controllers,models,routes,services,utils}
mkdir -p config
mkdir -p tests
mkdir -p docs

# Fichiers de base
touch src/index.js .gitignore README.md postman_collection.json

# Création du fichier .env
echo "url=''" > .env
echo "port=3000" >> .env
echo "secret_key='key_generate_token'" >> .env

# .gitignore
cat <<EOF > .gitignore
node_modules/
.env
dist/
logs/
EOF

# Service DB
mkdir -p src/services
echo "📦 Configuration du service de connexion à MongoDB..."
cat <<'EOF' > src/services/database.js
require("dotenv").config();
const mongoose = require("mongoose");

async function connectDb() {
    try {
        await mongoose.connect(process.env.url);
        console.log("✅ Connexion à MongoDB réussie !");
    } catch (err) {
        console.error("❌ Échec de connexion à MongoDB", err);
        process.exit(1);
    }
}

module.exports = { connectDb };
EOF

# Middleware auth (exemple simple)
mkdir -p src/middlewares
cat <<'EOF' > src/middlewares/authentification.js
async function authentification(req, res, next) {
    // Authentification fictive
    req.user = { _id: "mockId", isDeleted: false, authTokens: [] };
    req.auth = "mockToken";
    next();
}
module.exports = { authentification };
EOF

cat <<'EOF' > src/middlewares/logger.js
const chalk = require('chalk');

function logger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, headers, body, params, query } = req;

  const token = headers['authorization'] || 'Aucun token';

  console.log(chalk.blue.bold('\n===================================================================== DÉBUT DES LOGS ====================================================================='));
  console.log(chalk.cyan(`← Méthode:`), chalk.green(`${method}`), chalk.cyan(`URL:`), chalk.yellow(`${originalUrl}`));
  console.log(chalk.cyan(`← Headers:`), headers);
  console.log(chalk.cyan(`← Token:`), chalk.magenta(`${token}`));
  console.log(chalk.cyan(`← Query:`), JSON.stringify(query));
  console.log(chalk.cyan(`← Params:`), params);
  console.log(chalk.cyan(`← Body:`),  chalk.cyan(JSON.stringify(body)));
 

  // Capture de la réponse
  const oldSend = res.send;
  res.send = function (data) {
    res.locals.body = data; // stocker pour l'utiliser plus tard dans res.on('finish')
    return oldSend.call(this, data);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;

    console.log(chalk.cyan(`← Réponse:\n`), chalk.green.bold(format(res.locals.body) ?? 'Aucune réponse'));    
    console.log(chalk.cyan(`← Durée:`), chalk.green(`${duration}ms`));
    if (res.statusCode >= 400) {
      console.log(chalk.red.bold(`Erreur: Code ${res.statusCode}`));
    } else {
      console.log(chalk.green.bold(`← Statut: ${res.statusCode}`));
    }
    console.log(chalk.blue.bold('===================================================================== FIN DES LOGS =============================================================\n'));
  });

  next();
}

function format(data) {
    const parsed = JSON.parse(data);
    const objectKeys = Object.keys(parsed);

    let result = '';

    objectKeys.forEach((key) => {
        const value = parsed[key];
        const formattedValue = typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : value;

        result += `${key} :${formattedValue}\n`;
    });

    return result;
}
module.exports = { logger };
EOF



# Modèle User
mkdir -p src/models
cat <<'EOF' > src/models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    isDeleted: { type: Boolean, default: false },
    authTokens: [{ authToken: String }],
}, { timestamps: true });

userSchema.methods.generateTokenAndSaveUser = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, "secretkey");
    this.authTokens.push({ authToken: token });
    await this.save();
    return token;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = { User };
EOF

# Fonction pour créer un modèle
create_model() {
    read -p "Quel est le nom du modèle ? : " model_name

    mkdir -p src/models
    model_file="src/models/${model_name}.js"

    # Début du fichier
    cat <<EOL > "$model_file"
const validator = require("validator");
const mongoose = require("mongoose");

const ${model_name}Schema = new mongoose.Schema({
    name: { type: String, required: true },
EOL

    while true; do
        read -p "Entrez le nom d'un champ (ou appuyez sur Entrée pour terminer) : " field

        if [ -z "$field" ]; then
            break
        fi

        field=$(echo "$field" | xargs) # Trim

        if [ "$field" = "name" ]; then
            echo "⚠️  Le champ 'name' est déjà défini par défaut. Il sera ignoré."
            continue
        fi

        echo "Type pour le champ '$field' ?"
        echo "1) String"
        echo "2) Number"
        echo "3) Boolean"
        echo "4) Date"
        echo "5) Array"
        read -p "Choisissez un type (1-5) pour '$field' : " type_choice

        case $type_choice in
            1)
                echo "    $field: { type: String, required: true }," >> "$model_file"
                ;;
            2)
                echo "    $field: { type: Number, required: true }," >> "$model_file"
                ;;
            3)
                echo "    $field: { type: Boolean }," >> "$model_file"
                ;;
            4)
                echo "    $field: { type: Date }," >> "$model_file"
                ;;
            5)
                echo "    $field: { type: Array }," >> "$model_file"
                ;;
            *)
                echo "    $field: { type: String, required: true }," >> "$model_file"
                ;;
        esac
    done

    # Champs par défaut
    cat <<EOL >> "$model_file"
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: String, default: null },
    deleteAt: { type: Date, default: null },
    updatedBy: { type: String, default: null },
    updatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now }
});

const ${model_name^} = mongoose.models.${model_name^} || mongoose.model("${model_name^}", ${model_name}Schema);

module.exports = {
    ${model_name^}
};
EOL

    echo "✅ Modèle '$model_name' créé avec succès dans src/models/"
}


# Fonction pour créer un modèle préexistant (par exemple, User)
create_existing_model() {
    model_name="User"
    mkdir -p src/models

    cat <<EOL > src/models/$model_name.js
const validator = require("validator");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(v) {
            if (!validator.isEmail(v)) throw new Error("Email non valide");
        }
    },
    password: {
        type: String,
        required: true,
        validate(v) {
            if (!validator.isLength(v, { min: 4, max: 200 })) throw new Error("Mot de passe doit être entre 4 et 200 caractères");
        }
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedBy: {
        type: String,
        default: null,
    },
    deleteAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: String,
        default: null,
    },
    updatedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    authTokens : [{
        authToken: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.generateTokenAndSaveUser = async function() {
    const authToken = jwt.sign({ _id: this._id.toString() }, 'foo');
    this.authTokens.push({ authToken });
    await this.save();
    return authToken;
}

userSchema.pre('save', async function() {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 10);
    }
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = {
    User
}
EOL

    echo "✅ Le modèle '$model_name' a été créé dans 'src/models/$model_name.js'."

    cat > src/middlewares/authentification.js <<EOL
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

const authentification = async (req, res, next) => {
    try {
        const header = req.header('Authorization').replace("Bearer ", "");
        const decodeToken = jwt.verify(header, 'foo');
        const user = await User.findOne({ _id: decodeToken._id, 'authTokens.authToken': header });

        if (!user) throw new Error();
        req.user = user;
        req.auth = header;

        next();
    } catch (error) {
        res.status(401).send({
            data: {
                message: "Merci de vous authentifier !"
            }
        })
    }
}

module.exports = {
    authentification
}
EOL

}


# Demander à l'utilisateur s'il veut créer des modèles
model_created=false
while true; do
    echo "Souhaitez-vous créer un modèle ? (o/n)"
    read -p "(o/n): " create_model_choice

    if [[ "$create_model_choice" == "o" || "$create_model_choice" == "O" ]]; then
        # Demander si l'utilisateur veut créer un modèle préexistant (User par exemple)
        if [ "$model_created" == false ]; then
            read -p "Souhaitez-vous utiliser un modèle préexistant comme User ? (o/n) : " use_existing_model
            if [[ "$use_existing_model" == "o" || "$use_existing_model" == "O" ]]; then
                create_existing_model
                model_created=true
            else
                create_model
            fi
        else
            create_model
        fi
    else
        echo "Aucun modèle créé. Vous pouvez continuer."
        break
    fi
done


model_dir="src/models"
route_dir="src/routes"

mkdir -p "$route_dir"

# Parcourir chaque fichier modèle et créer des routes
for filepath in "$model_dir"/*.js; do
  filename=$(basename "$filepath")
  model="${filename%.*}"
  route_file="$route_dir/${model}.js"

  # Si le fichier de route existe déjà, on l’ignore
  if [[ -f "$route_file" ]]; then
    echo "⚠️  Route ${model}.js déjà existante. Ignorée."
    continue
  fi

  # Cas spécifique : User.js
  if [[ "${model,,}" == "user" ]]; then
    cat <<'EOF' > "$route_file"
const express = require('express');
const { User } = require('../models/user');
const {createUser, getUserByCriteria, updateUser, deleteUser, loginUser, userInfos, userLogout, userLogoutAll} = require('../controllers/user')
const router = new express.Router();
const bcrypt = require('bcrypt');
const { authentification } = require('../middlewares/authentification')

router.post("/user/create", createUser);

router.get("/user/getByCriteria", authentification, getUserByCriteria);

router.patch("/user/update", authentification, updateUser);

router.delete("/user/delete", authentification, deleteUser);

router.post("/user/login", loginUser);

router.get("/user/me", authentification, userInfos);

router.post("/user/logout", authentification, userLogout);

router.post("/user/logout/all", authentification, userLogoutAll);

module.exports = router;

EOF
    echo "✅ Route User.js générée avec contenu personnalisé !"
    continue
  fi

  # Autres modèles → template standard
  cat <<EOR > "$route_file"
const express = require('express');
const router = new express.Router();
const { create${model^}, get${model^}ByCriteria, update${model^}, delete${model^} } = require('../controllers/${model}');

router.post("/${model,,}/create", create${model^});

router.get("/${model,,}/getByCriteria", get${model^}ByCriteria);

router.patch("/${model,,}/update", update${model^});

router.delete("/${model,,}/delete", delete${model^});

module.exports = router;
EOR

  echo "✅ Route ${model}.js générée avec succès !"
done

# Création des controllers pour chaque modèle

model_dir="src/models"
controllers_dir="src/controllers"

mkdir -p "$route_dir"

# Parcourir chaque fichier modèle et créer des routes
for filepath in "$model_dir"/*.js; do
  filename=$(basename "$filepath")
  model="${filename%.*}"
  controller_file="$controllers_dir/${model}.js"

  # Si le fichier de route existe déjà, on l’ignore
  if [[ -f "$controller_file" ]]; then
    echo "⚠️  Controller ${model}.js déjà existante. Ignorée."
    continue
  fi

   # Cas spécifique : User.js
  if [[ "${model,,}" == "user" ]]; then
    cat <<'EOF' > "$controller_file"

const { User } = require('../models/user');

// Créer un utilisateur       
const createUser = async (req, res) => {
    try {
        const filter = { email: req.body.data.email };
        const findUserBeforeSave = await User.find(filter);
        if (findUserBeforeSave.length > 0) {
             res.status(409).send({ data: { message: "Utilisateur déjà existant !" } });
        }
        const user = new User(req.body.data);
        const userSave = await user.save();
        res.status(201).send({ status: 200, data: userSave, message: "Utilisateur enregistré avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// Obtenir tous les utilisateurs
const getUserByCriteria = async (req, res) => {
    const filter = { isDeleted: false };
    if (req.body.data?.email) {
        filter.email = { $regex: req.body.data.email, $options: "i" };
    }

   const startDate = req.body.data?.createdAt?.startDate ?? null;
    const endDate = req.body.data?.createdAt?.endDate ?? null;
    if (startDate && endDate) {
        const inputDateStart = req.body.data.createdAt.startDate;
        const inputDateEnd = req.body.data.createdAt.endDate;
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!regex.test(inputDateStart) || !regex.test(inputDateEnd)) {
            return res.status(400).json({ error: "Le format de date doit être jj/MM/YYYY." });
        }

        // Transformation de la date en format ISO
        const [day, month, year] = inputDateStart.split('/');
        const [dayEnd, monthEnd, yearEnd] = inputDateEnd.split('/');

        const formattedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const formattedDateEnd = new Date(`${yearEnd}-${monthEnd}-${dayEnd}T00:00:00.000Z`);


        filter.createdAt = {
            $gte: formattedDate,
            $lte: formattedDateEnd
        };
    } 

    const index = req.body.index || 0;
    const size = req.body.size || 10;
    try {
        const findAllUser = await User.find(filter).skip(index * size).limit(size).sort('-email');
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllUser.length,
            data: findAllUser.length === 0 ? "Aucun élément correspondant !" : findAllUser,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification d'utilisateur
const updateUser = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findUser = await User.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findUser[item] = req.body.data[item]);
        findUser.updatedAt = Date.now();
        findUser.updatedBy = findUser._id;
        await findUser.save();
        res.status(200).send({ data: { message: "Utilisateur modifié avec succès", data: findUser } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression d'utilisateur
const deleteUser = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findUserToDelete = await User.findOneAndUpdate(filter, { isDeleted: true });
        findUserToDelete.deletedBy = req.user._id;
        findUserToDelete.deleteAt = Date.now();
        await findUserToDelete.save();
        res.send({ status: 200, data: "Utilisateur supprimé avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Connexion d'utilisateur
const loginUser = async (req, res) => {
    const filter = { email: req.body.data.email };
    try {
        const findUser = await User.findOne(filter);
        if (!findUser || !req.body.data.password) throw new Error("Vérifiez vos informations !");
        const isMatch = await bcrypt.compare(req.body.data.password, findUser.password);
        if (!isMatch) throw new Error("Vérifiez vos informations de connexion ! !");
        const authToken = await findUser.generateTokenAndSaveUser();
        res.send({ status: 200, data: findUser });
    } catch (e) {
        res.status(401).send({ data: { message: e.message } });
    }
};

// Récupérer les informations d'utilisateur
const userInfos = async (req, res) => {
    try {
        if (!req.user || req.user.isDeleted) return res.status(404).send({ status: 404, data: { message: "Utilisateur introuvable." } });
        res.status(200).send({ status: 200, count: 1, data: req.user });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Déconnexion d'utilisateur

// Session unique
const userLogout = async (req, res) => {
    try {
        if (!req.user || req.user.isDeleted) return res.status(404).send({ status: 404, data: { message: "Utilisateur introuvable." } });
        const index = req.user.authTokens.findIndex(item => item.authToken === req.auth);
        if (index !== -1) req.user.authTokens.splice(index, 1);
        await req.user.save();
        res.status(200).send({ status: 200, data: { message: "Utilisateur déconnecté !" } });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Toutes les sessions
const userLogoutAll = async (req, res) => {
   try {
        req.user.authTokens = [];
        await req.user.save();
        res.status(200).send({ status: 200, data: { message: "Toutes les sessions ont été déconnectées !" } });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createUser,
    getUserByCriteria,
    updateUser,
    deleteUser,
    loginUser,
    userInfos,
    userLogout,
    userLogoutAll
};

EOF
    echo "✅ Controller user.js généré avec contenu personnalisé !"
    continue
  fi

  # Autres modèles → template standard
  cat <<EOR > "$controller_file"
const { ${model^} } = require('../models/${model}');

// Création : ${model^}       
const create${model^} = async (req, res) => {
    try {
        const ${model} = new ${model^}(req.body.data);
        const ${model^}Save = await ${model}.save();
        res.status(201).send({ status: 200, data: ${model^}Save, message: "${model^} enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : ${model^}
const get${model^}ByCriteria = async (req, res) => {
    const filter = { isDeleted: false };
    if (req.body.data?.name) {
        filter.name = { \$regex: req.body.data.name, \$options: "i" };
    } 


// filtre sur les dates
   const startDate = req.body.data?.createdAt?.startDate ?? null;
    const endDate = req.body.data?.createdAt?.endDate ?? null;
    if (startDate && endDate) {
        const inputDateStart = req.body.data.createdAt.startDate;
        const inputDateEnd = req.body.data.createdAt.endDate;
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!regex.test(inputDateStart) || !regex.test(inputDateEnd)) {
            return res.status(400).json({ error: "Le format de date doit être jj/MM/YYYY." });
        }

        // Transformation de la date en format ISO
        const [day, month, year] = inputDateStart.split('/');
        const [dayEnd, monthEnd, yearEnd] = inputDateEnd.split('/');

        const formattedDate = new Date(\`\${year}-\${month}-\${day}T00:00:00.000Z\`);

        const formattedDateEnd = new Date(\`\${yearEnd}-\${monthEnd}-\${dayEnd}T00:00:00.000Z\`);

        filter.createdAt = {
            \$gte: formattedDate,
            \$lte: formattedDateEnd
        };
    } 
    
    const index = req.body.index || 0;
    const size = req.body.size || 10;
    try {
       // const findAll${model^} = await ${model^}.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAll${model^} = await ${model^}.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAll${model^}.length,
            data: findAll${model^}.length === 0 ? "Aucun élément correspondant !" : findAll${model^},
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : ${model^}
const update${model^} = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const find${model^} = await ${model^}.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => find${model^}[item] = req.body.data[item]);
        find${model^}.updatedAt = Date.now();
        find${model^}.updatedBy = find${model^}._id;
        await find${model^}.save();
        res.status(200).send({ data: { message: "${model^} modifié(e) avec succès", data: find${model^} } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : ${model^}
const delete${model^} = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const find${model^}ToDelete = await ${model^}.findOneAndUpdate(filter, { isDeleted: true });
        find${model^}ToDelete.deletedBy = req.user._id;
        find${model^}ToDelete.deleteAt = Date.now();
        await find${model^}ToDelete.save();
        res.send({ status: 200, data: "${model^} supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    create${model^},
    get${model^}ByCriteria,
    update${model^},
    delete${model^}
};
EOR

  echo "✅ Route ${model}.js générée avec succès !"
done


# Création du fichier app.js
APP_FILE="app.js"
cat > app.js <<EOL
const { connectDb } = require('./src/services/database');
const {logger} = require('./src/middlewares/logger');

require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.port || 3000;

connectDb().catch((error) => console.log("erreur: ", error))

app.use(express.json());
app.use(logger);
EOL

# Parcours tous les fichiers .js du dossier routes
for file in ./src/routes/*.js; do
  filename=$(basename -- "$file")
  routeName="${filename%.*}"        # Supprime l'extension .js
  routeVarName="${routeName}Routes" # Exemple : userRoutes

  # Ajout des require
  echo "const $routeVarName = require('./src/routes/$routeName');" >> "$APP_FILE"
done

echo "" >> "$APP_FILE"

# Ajout des app.use
for file in ./src/routes/*.js; do
  filename=$(basename -- "$file")
  routeName="${filename%.*}"
  routeVarName="${routeName}Routes"

  echo "app.use($routeVarName);" >> "$APP_FILE"
done

# Fin du fichier
cat >> "$APP_FILE" <<EOL

app.listen(port, () => {
    console.log(\`Le serveur est lancé sur http://localhost:\${port}\`)
})
EOL

echo "📦 App.js configuré"

# Initialisation Node.js
echo "📦 Initialisation du projet Node.js..."
npm init -y

# Chemin de la collection
COLLECTION_FILE="postman_collection.json"

# Début de la collection Postman
cat > "$COLLECTION_FILE" <<EOF
{
  "info": {
    "name": "$PROJECT_NAME API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
EOF

first=1

for model in "$model_dir"/*.js; do
  filename=$(basename "$model" .js)

  # Ajouter une virgule entre les éléments sauf pour le premier
  if [ $first -eq 0 ]; then
    echo "," >> "$COLLECTION_FILE"
  fi
  first=0

  cat >> "$COLLECTION_FILE" <<EOF
    {
      "name": "$filename",
      "item": [
        {
          "name": "$filename-getByCriteria",
          "request": {
            "method": "GET",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data\": {\n    \"name\": \"\"\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3000/$filename/getByCriteria",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["$filename", "getByCriteria"]
            }
          }
        },
        {
          "name": "$filename-create",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data\": {\n    \"name\": \"\"\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3000/$filename/create",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["$filename", "create"]
            }
          }
        },
        {
          "name": "$filename-update",
          "request": {
            "method": "PATCH",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data\": {\n    \"id\": \"\"\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3000/$filename/update",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["$filename", "update"]
            }
          }
        },
        {
          "name": "$filename-delete",
          "request": {
            "method": "DELETE",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data\": {\n    \"id\": \"\"\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:3000/$filename/delete",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["$filename", "delete"]
            }
          }
        }
EOF

  # Ajouter endpoints supplémentaires dans le même bloc pour user.js
  if [ "$filename" = "user" ]; then
    cat >> "$COLLECTION_FILE" <<EOF
        ,
        {
          "name": "user-login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data\": {\n    \"email\": \"\",\n    \"password\": \"\" }\n}"
            },
            "url": {
              "raw": "http://localhost:3000/user/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["user", "login"]
            }
          }
        },
        {
          "name": "user-me",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "url": {
              "raw": "http://localhost:3000/user/me",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["user", "me"]
            }
          }
        },
        {
          "name": "user-logout",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "url": {
              "raw": "http://localhost:3000/user/logout",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["user", "logout"]
            }
          }
        },
        {
          "name": "user-logout-all",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "url": {
              "raw": "http://localhost:3000/user/logout/all",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["user", "logout/all"]
            }
          }
        }
EOF
  fi

  echo "      ]" >> "$COLLECTION_FILE"
  echo "    }" >> "$COLLECTION_FILE"
done

# Fin du JSON
echo "  ]" >> "$COLLECTION_FILE"
echo "}" >> "$COLLECTION_FILE"

# Installation des dépendances
echo "📥 Installation des dépendances..."
npm install bcrypt@^5.1.1 dotenv@^16.5.0 express@^5.1.0 jsonwebtoken@^9.0.2 mongodb@^6.15.0 mongoose@^8.14.1 validator@^13.15.0

echo "✅ Projet '$PROJECT_NAME' prêt avec toutes les dépendances installées."
echo "Le projet est situé dans $(pwd)"
