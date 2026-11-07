<!-- Published by scripts/package_readmes.py from fiberfx/cms/README.md at c07b674ab30651fb465cf81a1bba7c6aac6d7d5c. Edit it there. -->
# @fiberfx/cms

Editorial compositions of the **Mercury** design system: screens an administrator works in,
composed from `@fiberfx/ui` components and driven by state models such as those of
`@fiberfx/effector`. A composition renders what it is given; it owns no storage server,
permission or approval policy. The first composition is the collection workspace of
mercury.16.

```tsx
import { CollectionWorkspace } from "@fiberfx/cms";

// collection = createCollection({ adapter, fields, getRowKey })
// bulk = createCollectionBulk({ collection, adapter })
<CollectionWorkspace label="Documents" collection={collection} bulk={bulk}
  columns={[{ key: "title", label: "Title" }]} actions={[{ id: "publish", label: "Publish" }]} />
```

The workspace reads its models through hooks (`useCollection`, `useBulk`) whose shapes it declares
itself (`WorkspaceCollectionView`, `WorkspaceBulkView`), so it imports no state library. Its
contract is `src/collections/CollectionWorkspace.prompt.md`.
