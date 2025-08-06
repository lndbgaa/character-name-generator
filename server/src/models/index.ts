import Favorite from "@/models/Favorite.model.js";
import Gender from "@/models/Gender.model.js";
import Name from "@/models/Name.model.js";
import PasswordResetToken from "@/models/PasswordResetToken.model.js";
import RefreshToken from "@/models/RefreshToken.model.js";
import Role from "@/models/Role.model.js";
import Type from "@/models/Type.model.js";
import Universe from "@/models/Universe.model.js";
import User from "@/models/User.model.js";

Universe.hasMany(Type, { foreignKey: "universe_id", as: "types" });
Type.belongsTo(Universe, { foreignKey: "universe_id", as: "universe" });

Type.hasMany(Name, { foreignKey: "type_id", as: "names" });
Name.belongsTo(Type, { foreignKey: "type_id", as: "type" });

Gender.hasMany(Name, { foreignKey: "gender_id", as: "names" });
Name.belongsTo(Gender, { foreignKey: "gender_id", as: "gender" });

Favorite.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Favorite, { foreignKey: "user_id", as: "favorites" });
Favorite.belongsTo(Name, { foreignKey: "name_id", as: "name" });
Name.hasMany(Favorite, { foreignKey: "name_id", as: "favorites" });

User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

RefreshToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(RefreshToken, { foreignKey: "user_id", as: "refresh_tokens" });

PasswordResetToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(PasswordResetToken, { foreignKey: "user_id", as: "user" });

export { Favorite, Gender, Name, PasswordResetToken, RefreshToken, Role, Type, Universe, User };
