import { type GlobalConfigurableSettings } from "../config";
import { type AuthLevelOptions, type AuthRequirement } from "../middleware/auth/routeAuth";
import { type AuthUser } from "./auth-types";


export type AppEnv = {
    Bindings: Env;
    Variables: {
        user: AuthUser | null;
        sessionId: string | null;
        config: GlobalConfigurableSettings;
        authLevel: AuthRequirement;
        authLevelOptions?: AuthLevelOptions;
    }
}
