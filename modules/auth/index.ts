import { authService, AuthSignupData } from './services/auth-service';
import { 
  GET_USER_BY_ID,
  UPDATE_USER_PROFILE,
} from './services/auth-graphql';

export { 
  authService,
  // Export GraphQL queries and utilities
  GET_USER_BY_ID,
  UPDATE_USER_PROFILE,
};
export type { AuthSignupData }; 