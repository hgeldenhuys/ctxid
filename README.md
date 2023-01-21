# ctxid - ContextID scheme for DDD

This is a tiny library for generating and inspecting what can be called
a "Domain Driven Design"-like IDs, that embed metadata like type, owner, 
name and timestamp.

Instead of using random UUIDs, this library generates IDs that are
meaningful, readable, sortable and queryable.

## Domain structure

The basic structure of the ID is:
```
// acme/anvil/JM1KHIS4391nNe6
// ^    ^     ^
// |    |     context id with date
// |    type or subdomain-name
//  namespace or domain-name
// 
// the first 10 chars in the context-id JM1KHIS4391nNe6
// is the date when it was created, and the last 5 characters are random
// to space out collisions (although the length is configurable).
```

Like domain names, objects can belong to nested domains and subdomains. 

The top-level domain is known as a `namespace`. This is the highest level
that can be used to group all the objects of that top-level domain.

`domain/type/context-id`

Domain is optional, if not specified, the object can be considered "global" 
or "universal" or as not belonging to a specific owner.

`/type/context-id/type/context-id`

A nested domain or subdomain is just added as a postfix to the ID:
`domain/type/context-id/sub-domain/sub-context-id/.../.../...`

### Example

Let's say your company name is ACME corp and you build anvils,
your namespace would be `acme` and your type-name will be `anvil`,
the ID of an anvil could look like this:
```typescript
const ctx = ctxId({domain: 'acme', type: 'anvil'});
console.log({ctx});
// > { ctx: 'acme/anvil/JM1KHIS4391nNe6' }

// Decoding the date we use the following:
const date = ctxDate('JM1KHIS4391nNe6')
console.log({date})
// > { date: 2023-01-21T18:19:29.439Z }

// or if we want to inspect the full context-id:
const info = inspectCtx('acme/anvil/JM1KHIS4391nNe6')
console.log({info})
```
Output:
```json
{
    "info": {
        "meta": {
            "timestamp": "2023-01-21T18:27:43.596Z",
            "ageMs": 494157,
            "id": "acme/anvil/JM1KHIS4391nNe6",
            "version": "latest",
            "hasVersion": false
        },
        "namespace": "acme",
        "type": "anvil",
        "id": "JM1KHIS4391nNe6",
        "isSequence": false,
        "typePointer": "anvil",
        "idPointer": "acme/JM1KHIS4391nNe6",
        "typePath": "anvil",
        "idPath": "acme.JM1KHIS4391nNe6",
        "date": "2023-01-21T18:19:29.439Z",
        "relativeDate": null,
        "domain": {
            "id": "acme",
            "type": "namespace"
        },
        "validLength": true,
        "length": 3,
        "seed": [
            1,
            50,
            24,
            41,
            6
        ]
    }
}
```

If you want a list of all the anvils, you can use a query like 
`startsWith('acme/anvil')` or something similar.

### Subdomains

Let's say ACME corp has a subsidiary called "Anvil Inc" and
"Heavy Inc", who each manufacture anvils, the IDs of the 
anvils could look like this:

```typescript
const anvilInc = ctxId({type: "subsidiary", domain: "acme"})
const heavyInc = ctxId({type: "subsidiary", domain: "acme"})

const anvil1 = ctxId({type: "anvil", domain: anvilInc})
const anvil2 = ctxId({type: "anvil", domain: heavyInc})

console.log({office1, office2, anvil1, anvil2})

/*

{
  anvilInc: 'acme/subsidiary/JM1KID7944jR0ml',
  heavyInc: 'acme/subsidiary/JM1KID7944lbF7g',
  anvil1: 'acme/subsidiary/JM1KID7944jR0ml/anvil/JM1KID7944EE5wM',
  anvil2: 'acme/subsidiary/JM1KID7944lbF7g/anvil/JM1KID7944UTwwv'
}

*/
```

Alternatively, you can just use the names of the subsidiaries
instead of a generated ID since these are already unique
at a name-level:

```typescript
const anvilInc = 'acme/subsidiary/anvil-inc'
const heavyInc = 'acme/subsidiary/heavy-inc'

const anvil1 = ctxId({type: "anvil", domain: anvilInc})
const anvil2 = ctxId({type: "anvil", domain: heavyInc})

console.log({anvilInc, heavyInc, anvil1, anvil2})
/*
 
{
  anvilInc: 'acme/subsidiary/anvil-inc',
  heavyInc: 'acme/subsidiary/heavy-inc',
  anvil1: 'acme/subsidiary/anvil-inc/anvil/JM1KIG9574Ymjqr',
  anvil2: 'acme/subsidiary/heavy-inc/anvil/JM1KIG9574Hg_JT'
}

*/
```

Looking at these IDs, we can see the relationship the object has
to its domain and subdomains, and you can query parts of the ID
to retrieve types of collections inside a domain and having it 
sorted chronologically by default.


## Benchmark

Machine: Apple M1 Max

Avg. time to generate 1,000,000 IDs: 460ms
