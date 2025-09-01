import { rolesService } from './services/roles-service';
import { Role } from './models/role';

// Export GraphQL queries for direct use if needed
import { 
  GET_ALL_ROLES,
  GET_ROLE_BY_ID,
  GET_ROLES_WITH_ACCESS,
  GET_ROLES_PAGINATED,
  SEARCH_ROLES
} from './services/roles-graphql';

export { 
  rolesService,
  // Export GraphQL queries
  GET_ALL_ROLES,
  GET_ROLE_BY_ID,
  GET_ROLES_WITH_ACCESS,
  GET_ROLES_PAGINATED,
  SEARCH_ROLES
};

export type { Role }; 