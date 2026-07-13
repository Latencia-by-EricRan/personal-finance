import { Identity } from '../../../../shared/domain/Identity';
import { Repository } from '../../../../shared/application/ports/Repository';
import { ExampleItem } from '../../domain/ExampleItem';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- per-aggregate port intentionally adds no methods yet; extends the generic port as designed.
export interface ExampleItemRepository extends Repository<ExampleItem, Identity> {}
