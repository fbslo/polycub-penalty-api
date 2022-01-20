- Every 3000 blocks, get all `Claim` events from masterchef, sum `penalty` amount.

---

API:

`GET`:

```
{
  "week": "123000000000000000000", //penalty received in the last week, no decimals, so divide by 10^18 to get human readable format
  "day": "1230000000000000000"
}
```
