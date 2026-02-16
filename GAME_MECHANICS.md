# Miranda Republic -- Game Mechanics Documentation

*Last updated: v1.0 (February 2026)*

This document describes all game mechanics, systems, and design rationale in detail. It is intended as a reference for development, balance tuning, and onboarding.

---

## Table of Contents

1. [Overview](#overview)
2. [Turn Structure](#turn-structure)
3. [Resources](#resources)
4. [Political Blocs](#political-blocs)
5. [Actions and Policies](#actions-and-policies)
6. [The Rival](#the-rival)
7. [The Colossus](#the-colossus)
8. [Congress](#congress)
9. [Narrative System](#narrative-system)
10. [Labor Cohesion](#labor-cohesion)
11. [Central Bank Independence](#central-bank-independence)
12. [Polarization](#polarization)
13. [Interaction Matrix (Ripple Effects)](#interaction-matrix-ripple-effects)
14. [Discovery and Scandal](#discovery-and-scandal)
15. [Events](#events)
16. [Crisis Chains](#crisis-chains)
17. [Win and Loss Conditions](#win-and-loss-conditions)
18. [Difficulty Settings](#difficulty-settings)
19. [Design Rationale](#design-rationale)
20. [Changelog](#changelog)

---

## Overview

Miranda Republic is a turn-based political simulation. The player is president of a fictional developing nation called Miranda and must survive 48 turns (representing a four-year term, one turn per month). The game models tensions between 14 political blocs, a rising political rival, a foreign superpower (the Colossus), and various economic and social pressures.

The core loop each turn: read the news, choose up to two policy actions, then watch the consequences ripple through every faction and resource.

---

## Turn Structure

Each turn proceeds through seven phases in order:

1. **News Phase** -- A news event is selected and presented. Crisis events from the queue take priority. Events may require the player to make a choice, or auto-resolve with preset effects. If no event triggers, a "quiet month" placeholder appears.

2. **Briefing Phase** -- Informational only. No state changes. The player reviews the current situation before acting.

3. **Action Phase** -- The player submits up to two policy actions. Each action is resolved sequentially: requirements are checked, capital costs are deducted (with modifiers), bloc effects are applied with sensitivity scaling, ripple effects propagate, resource deltas apply, and discovery rolls are made for backroom actions.

4. **Reaction Phase** -- Automated systems process in this order:
   - Rival power growth
   - Colossus patience/alignment effects
   - Central Bank independence effects
   - Delayed effects tick down
   - Pending discoveries tick down (scandals may fire)
   - Crisis chains advance or trigger
   - Trade income is added
   - Base capital income is added

5. **Congressional Phase** -- Seat shares are recalculated based on bloc power. Friendly majority status is updated.

6. **Narrative Phase** -- Narrative resource shifts based on cultural bloc loyalties.

7. **End Phase** -- Labor cohesion streak processing, congressional legitimacy bonus/penalty (+1 with friendly majority, -1 without), end-phase loyalty threshold events, legitimacy decay shield (Story mode), and win/loss condition checks. If the game continues, the turn counter advances.

---

## Resources

Eight tracked resources govern the state of Miranda. Each has a defined range.

| Resource | Range | Starting Value | What It Represents |
|---|---|---|---|
| **Legitimacy** | 0-100 | 65 | How valid the population considers your government. Reaching 0 triggers impeachment. |
| **Narrative** | 0-100 | 45 | Control of the public story. Driven by cultural blocs (Media, Artists, Scholars, Clergy). High narrative suppresses rival growth. Low narrative accelerates it. |
| **Capital** | 0-999 | 200 | Political and financial resources available for actions. Replenished by trade income, base income, and certain policies. |
| **Mobilization** | 0-100 | 40 | The energy of your political base. High mobilization suppresses rival growth. Lost through austerity and backlash. |
| **Polarization** | 0-100 | 25 | How divided the country is. Affects policy costs, enables/disables certain actions, fuels rival growth, and can trigger backlash against centrist policies. |
| **Inflation** | 0-30 | 6 | Economic pressure. Above 10, it accelerates rival growth (+2 per 5 points). Above 12, it can trigger the currency crisis event. Above 18, it triggers the banking crisis chain. |
| **Dread** | 0-100 | 15 | Fear of the state. High dread combined with low military loyalty triggers a coup. |
| **Colossus Alignment** | 0-100 | 65 | How aligned Miranda is with the foreign superpower. Affects trade income, Colossus patience, and bloc loyalties. |

### How Resources Are Gained and Lost

- **Capital** comes from: base income per turn (difficulty-dependent: 10/5/3), trade income (based on Colossus trade dependency and alignment), policies that generate capital, and low central bank independence (+3/turn).
- **Legitimacy** changes from: congressional majority status (+1/-1 per turn), central bank independence (high CBI gives +1/turn), policies, events, and discovery scandals. Story mode has a legitimacy decay shield that reduces losses by up to 3 per turn.
- **Narrative** is primarily driven by the narrative phase (cultural bloc loyalties) and modified by policies and events.
- **Mobilization** is gained through populist, labor, and green policies. Lost through austerity and backlash.

---

## Political Blocs

14 factions compete for influence in Miranda. Each bloc has two core attributes:

- **Loyalty** (0-100): How much the bloc supports the player's government. Blocs with loyalty >= 50 are considered "friendly" for congressional majority calculations.
- **Power** (0-100): The bloc's overall influence in society. Determines congressional seat share.

### Bloc Sensitivities

Each bloc has two sensitivity scores (0-100) that act as multipliers for how strongly they react to different policy types:

- **Material sensitivity**: Multiplier for economic, labor, security, institutional, and diplomatic policies. Formula: `sensitivity / 50` (so 50 = 1.0x, 100 = 2.0x, 25 = 0.5x).
- **Narrative sensitivity**: Multiplier for rhetoric policies. Same formula.
- **Backroom** policies always use a 1.0x multiplier (they bypass sensitivities entirely).

### All 14 Blocs

| Bloc | Player-Facing Name | Ideology | Start Loyalty | Start Power | Material / Narrative Sensitivity |
|---|---|---|---|---|---|
| court | The Court | 0 (center) | 60 | 70 | 70 / 30 |
| military | The Generals | +30 (right) | 50 | 80 | 75 / 40 |
| enforcers | The Enforcers | +40 (right) | 45 | 50 | 70 / 55 |
| finance | The Banks | +20 (right) | 55 | 85 | 85 / 35 |
| industry | The Factories | +15 (right) | 45 | 55 | 80 / 30 |
| tech | Big Tech | +10 (right) | 50 | 60 | 65 / 55 |
| agri | The Landowners | +30 (right) | 50 | 55 | 75 / 25 |
| mainStreet | Main Street | +15 (right) | 50 | 40 | 55 / 65 |
| media | The Heralds | -5 (center-left) | 55 | 65 | 60 / 70 |
| clergy | The Clergy | +45 (right) | 45 | 50 | 55 / 65 |
| academy | The Scholars | -30 (left) | 50 | 35 | 65 / 50 |
| artists | The Artists | -40 (left) | 45 | 30 | 55 / 70 |
| labor | The Unions | -35 (left) | 45 | 45 | 70 / 45 |
| syndicate | The Underworld | 0 (neutral) | 35 | 40 | 90 / 10 |

---

## Actions and Policies

The player selects up to two actions per turn from a pool of 46 policies across 8 categories.

### Categories

| Category | Type | Congressional Cost Modifier | Notes |
|---|---|---|---|
| economic | Legislative | Yes (0.85x/1.15x) | Broad economic interventions |
| labor | Legislative | Yes | Worker-focused policies |
| security | Legislative | Yes | Military, police, and order policies |
| institutional | Legislative | Yes | Governance and constitutional changes |
| diplomatic | Legislative | Yes | Foreign relations and Colossus interaction |
| rhetoric | Bypass | No (always 1.0x) | Public messaging and narrative control |
| backroom | Bypass | No (always 1.0x) | Covert deals with discovery risk |
| social | Legislative | Yes | Social programs (currently unused in policy list) |

### Cost Calculation

The actual capital cost of a policy is:

```
totalCost = baseCost * polarizationMod * gridlockMod * syndicateDiscount * congressMod
```

Where:
- **Polarization modifier** (centrist policies): 1.0x if polarization < 30, 1.25x if < 60, 1.5x if < 80, 2.0x if >= 80. Non-centrist policies: 0.75x discount if polarization >= 60, otherwise 1.0x.
- **Gridlock modifier**: 1.2x if the rival's gridlock countdown is active (rival power crossed 50 threshold).
- **Syndicate discount**: 0.7x on backroom actions if Underworld loyalty > 60.
- **Congressional modifier**: 0.85x with friendly majority, 1.15x without (legislative categories only).

### Centrist vs. Non-Centrist

Each policy is tagged as centrist or non-centrist. This distinction affects:
- **Cost scaling with polarization**: Centrist policies get more expensive as polarization rises. Non-centrist policies get a discount at high polarization (>= 60).
- **Backlash risk**: Only centrist policies can trigger backlash at high polarization. At polarization 60-79, there's a 20% chance. At 80+, 40% chance. Backlash costs -5 Narrative and -5 Mobilization.

### Polarization Windows

Every policy has a `minPolarization` and `maxPolarization`. The policy is only available when current polarization falls within this range. This represents how the political climate shapes what's possible.

### Special Requirements

Some policies have additional requirements:
- **requiresSyndicateLoyalty**: Underworld loyalty must be at or above a threshold (e.g., Informal Channels requires 40).
- **requiresMajority**: The player must have a friendly congressional majority (e.g., Constitutional Amendment, Electoral Reform).

### Target Bloc Policies

Backroom policies marked `targetBloc: true` let the player choose which bloc receives a loyalty bonus:
- **Backroom Appropriations**: +15 loyalty to the chosen bloc.
- **Informal Channels**: +10 loyalty to the chosen bloc (requires Underworld loyalty >= 40).
- **Blackmail Dossier**: +15 loyalty to the chosen bloc.

### Key Policies Reference

#### Backroom Policies (and Why They Matter)

**Backroom Appropriations** ("Grease the wheels"): Costs 20 capital. Gives +15 loyalty to a chosen bloc but costs -5 legitimacy. Has a 30% discovery chance (delayed 3 turns). If discovered, the Court loses -10 loyalty, the Heralds lose -15, narrative drops -8, and the rival gains +5 power. The Underworld's high loyalty (> 60) halves the discovery chance and gives a 30% cost discount.

**Informal Channels** ("The Underworld knows people"): Costs 15 capital. Requires Underworld loyalty >= 40. Gives +10 loyalty to a chosen bloc and +3 dread. Has a 20% discovery chance (delayed 4 turns) with even harsher penalties if caught: Court -15, Heralds -20, legitimacy -10, narrative -12, rival +8. This is why Informal Channels is unavailable at the start... the Underworld starts at 35 loyalty, which is below the 40 threshold. You need to build trust with the Underworld first.

**Blackmail Dossier**: Costs 10 capital. +15 loyalty to chosen bloc, +5 dread, -3 legitimacy. 35% discovery chance (2-turn delay) with severe penalties.

**Offshore Accounts**: Costs 5 capital. Gives +30 capital immediately. Banks +5, Underworld +5, but legitimacy -5. 25% discovery chance (4-turn delay) with devastating exposure: Court -20, Heralds -15, legitimacy -20, narrative -15, rival +10.

**Palace Coup Insurance**: Costs 25 capital. Generals +15, Enforcers +5. Buys military loyalty directly but costs -3 legitimacy and +3 dread.

**Shadow Cabinet**: Costs 15 capital. Underworld +10, mobilization +5, dread +5, legitimacy -5. 30% discovery risk with catastrophic exposure penalties.

#### Rhetoric Policies

**The Blame Game** (Scapegoat Campaign): Costs 5 capital. Requires polarization >= 40 (this is why it's unavailable early, polarization starts at 25). Gives Main Street +10, Clergy +5, but Artists -15, Scholars -10. Raises polarization +8 and mobilization +5, lowers narrative -3, and reduces rival power -3. Significantly damages labor cohesion (-8). A high-impact short-term tool with long-term costs.

**Public Reconciliation Forum**: Costs 2 capital. A cheap centrist tool that reduces polarization -5, gives narrative +3, and reduces rival power -2.

**Counter-Propaganda Bureau**: Costs 3 capital. Narrative +5, rival -4, but polarization +3 and Scholars -5.

**State Media Blitz**: Costs 10 capital. Heralds +10, narrative +8, but Scholars -5 and Artists -3.

**Populist Pivot**: Costs 3 capital. Main Street +10, Unions +5, mobilization +5, rival -2, but Banks -10 and polarization +3.

#### Notable Other Policies

**Green Industrial Policy**: Costs 35 capital. One of the most expensive policies. Boosts Factories, Unions, Scholars, Artists, mobilization, and narrative. Angers Landowners and Banks. Good for labor cohesion.

**Sovereignty Trade Package**: Costs 20 capital. Boosts domestic industry and Unions. Reduces Colossus alignment -15. Creates delayed income (+5 capital/turn for 6 turns).

**Sovereign Wealth Fund**: Costs 40 capital (most expensive). Long-term investment: +8 capital/turn for 8 turns (64 total return on 40 investment).

**Constitutional Amendment**: Costs 20 capital. Requires congressional majority. Court +10, Scholars +10, legitimacy +8. One of the strongest legitimacy-building tools.

---

## The Rival

A procedurally generated political opponent with one of four backgrounds, each with distinct narrative flavor.

### Rival Backgrounds

| Background | Title | Possible Names |
|---|---|---|
| congressional_leader | Congressional Leader | Senator Vidal, Senator Correa, Speaker Moreno |
| regional_governor | Regional Governor | Governor Torres, Governor Almeida, Governor Fuentes |
| retired_general | Retired General | General Cardoso, General Montoya, General Braga |
| media_personality | Media Personality | Ricardo Vox, Diana Cruz, Marco Estrella |

### Rival Power (0-100, starts at 15)

The rival's power grows each turn based on the player's weaknesses. If it reaches 100, the player loses ("Rival Wins" ending).

#### Growth Formula

Base growth: +1 per turn (structural discontent). Then modifiers:

**Accelerators (things that increase rival growth):**
- Polarization above 30: +1 per 5 points over 30
- Inflation above 10: +2 per 5 points over 10
- Legitimacy below 40: +3
- Labor cohesion below 25: +2
- Narrative below 30: +1
- No congressional majority: +1

**Suppressors (things that slow rival growth):**
- Mobilization above 40: -1 per 8 points over 40
- Narrative above 50: -2
- Labor cohesion above 40: -1 per 8 points over 40
- Legitimacy above 70: -2

The total is capped at +8 before the difficulty multiplier is applied (Story: 0.15x, Standard: 1.0x, Crisis: 1.5x).

### Rival Thresholds

At specific power levels, one-shot events trigger and special effects activate:

| Power Level | Effect |
|---|---|
| 30 | **The Rally** event (player chooses how media covers it) |
| 50 | **Congressional Gridlock** event. Gridlock countdown activates (4 turns of +20% cost on all policies) |
| 60 | **Culture War Offensive** event. Culture war countdown activates (4 turns; Clergy and Main Street lose -5 loyalty/turn if their loyalty is below 50) |
| 70 | **Crisis of Legitimacy** event (if Court loyalty <= 60). Legitimacy -10. |
| 85 | **The Oligarch's Bet** event. Capital -20, rival +5. |
| 95 | **March on Miranda** event. Polarization +10, narrative -20, legitimacy -10. |

### Rival Action Text

Each turn, the rival performs a narrative action based on their background, current power tier, and the player's most exploitable weakness. These are flavor text displayed in the UI.

Power tiers: Low (0-35), Mid (36-65), High (66+).

Weaknesses are identified by severity: low legitimacy, high inflation, no majority, high polarization, or low narrative.

---

## The Colossus

A foreign superpower that exerts economic and political pressure on Miranda.

### Colossus State

| Attribute | Range | Start | Description |
|---|---|---|---|
| Alignment | 0-100 | 65 | Synced with the colossusAlignment resource. How aligned Miranda's policies are with Colossus interests. |
| Patience | 0-100 | 70 | How tolerant the Colossus is. Decays when alignment is low. |
| Trade Dependency | 0-100% | 40 | How much of Miranda's economy depends on Colossus trade. |

### Patience Mechanics

Each turn:
- Alignment < 40: Patience -3
- Alignment 40-54: Patience -1
- Alignment > 70: Patience +1 (slow recovery)

When patience reaches 0: Economic crisis hits every turn (capital -15, inflation +2, Banks loyalty -5).

### Alignment Effects on Blocs

Each turn:
- Alignment > 70: Banks +1 loyalty, Scholars -1 loyalty (dependency resentment)
- Alignment < 30: Factories +1 loyalty (protectionism benefit), Banks -2 loyalty

### Trade Income

```
tradeIncome = round(10 * tradeDependency / 100)
```

If alignment < 30, trade income is halved. At the default 40% trade dependency, this yields 4 capital/turn normally, or 2 capital/turn if alignment drops below 30.

### Colossus Crisis Chain

When patience drops below 20, the Colossus Pressure crisis chain triggers (see Crisis Chains section).

---

## Congress

Congress represents the legislative branch and affects policy costs and legitimacy.

### Seat Shares

Seat shares are proportional to each bloc's power, recalculated every turn. Two special cases:
- **Underworld**: Power is multiplied by 0.3x for seat calculation (they operate outside formal politics).
- **Unions**: Use "effective power" = `basePower * (0.5 + laborCohesion / 200)`. At cohesion 0, they operate at 50% effectiveness. At cohesion 100, they operate at 100%.

### Friendly Majority

Blocs with loyalty >= 50 are "friendly." If friendly blocs hold > 50% of total seat share, the player has a friendly majority.

### Effects of Majority

- **Policy cost modifier**: Legislative policies cost 0.85x with majority, 1.15x without. Rhetoric and backroom policies are unaffected.
- **Legitimacy per turn**: +1 with majority, -1 without.
- **Rival growth**: +1 when there is no majority.
- **Policy access**: Constitutional Amendment and Electoral Reform require majority.

---

## Narrative System

Narrative represents control of the public story. It shifts each turn based on the weighted loyalty of four "cultural" blocs:

| Bloc | Weight |
|---|---|
| The Heralds (media) | 35% |
| The Artists (artists) | 25% |
| The Scholars (academy) | 20% |
| The Clergy (clergy) | 20% |

### Calculation

The weighted average of these four blocs' loyalty is computed. The difference from 50 determines the shift:

- **Weighted loyalty > 50** (cultural blocs support you): Narrative gains slowly. +1 to +3 per turn (= `clamp(round((weightedLoyalty - 50) / 15), 1, 3)`).
- **Weighted loyalty < 40** (cultural blocs oppose you): Narrative falls quickly. -2 to -8 per turn (= `clamp(round((weightedLoyalty - 50) / 5), -8, -2)`).
- **Weighted loyalty 40-50**: No change.

### Why Narrative Matters

- **Rival suppression**: Narrative > 50 gives -2 rival growth. Narrative < 30 gives +1 rival growth.
- **Endings**: Narrative > 60 or 70 is required for the best endings (A New Story, New Compact).
- **Backlash**: Narrative is lost (-5) when centrist backlash triggers at high polarization.

---

## Labor Cohesion

A hidden stat (0-100, starts at 40) representing how organized and effective the labor movement is.

### Streak-Based Changes

- **Union loyalty > 70 for 3+ consecutive turns**: Cohesion +2/turn (sustained trust builds capacity).
- **Polarization > 60 for 4+ consecutive turns**: Cohesion -2/turn (division erodes solidarity).

### Direct Changes

Many policies affect cohesion directly:
- Increases: Platform Worker Rights (+5 to +8 conditional), Green Industrial Policy (+5), labor policies generally (+3 to +8).
- Decreases: Austerity Budget (-5), The Blame Game (-8), Culture War Offensive event (-10).

### Why Labor Cohesion Matters

- **Congressional power**: Union effective power = basePower * (0.5 + cohesion/200). Low cohesion halves union representation.
- **Rival growth**: Cohesion < 25 adds +2 rival growth. Cohesion > 40 subtracts (-1 per 8 points above 40).
- **Endings**: Cohesion >= 80 (combined with rival < 30 and narrative > 70) unlocks the secret "New Compact" ending. Cohesion < 25 leads to the "Manager's Victory" ending.
- **Crisis trigger**: The Labor Uprising crisis chain triggers when union loyalty < 20 AND cohesion > 60 (paradoxically, organized workers who feel betrayed are more dangerous).

---

## Central Bank Independence

A hidden stat (0-100, starts at 60) representing how autonomous the central bank is from political control.

### Per-Turn Effects

| CBI Level | Banks Loyalty | Legitimacy | Inflation | Capital |
|---|---|---|---|---|
| >= 70 (high) | +1/turn | +1/turn | +1 every 2 turns | -- |
| 30-69 (mid) | No effect | No effect | No effect | No effect |
| < 30 (low) | -2/turn | -- | +1/turn | +3/turn |

### Design Trade-off

High CBI provides institutional credibility (legitimacy, Banks support) but limits monetary policy flexibility (mild inflation drift). Low CBI provides extra capital and monetary control but at the cost of Banks loyalty and faster inflation. The mid range is stable but offers no bonuses.

### Policies That Affect CBI

- Central Bank Autonomy Act: +15 CBI
- Monetary Sovereignty Decree: -20 CBI
- Interest Rate Override: -10 CBI

---

## Polarization

Polarization (0-100, starts at 25) represents how ideologically divided the country is. It's one of the most consequential resources.

### Effects on Policy Costs

**Centrist policies** (compromise, moderate reforms):
- Polarization < 30: No modifier (1.0x)
- 30-59: Costs increase 25% (1.25x)
- 60-79: Costs increase 50% (1.5x)
- 80+: Costs double (2.0x)

**Non-centrist policies** (ideological actions):
- Polarization >= 60: Costs decrease 25% (0.75x discount)
- Otherwise: No modifier (1.0x)

### Backlash

Only centrist policies can trigger backlash:
- Polarization 60-79: 20% chance per centrist action
- Polarization 80+: 40% chance per centrist action
- Backlash effect: Narrative -5, Mobilization -5

### Other Effects

- Polarization > 30: +1 rival growth per 5 points above 30
- High polarization streak (> 60 for 4+ turns): Labor cohesion -2/turn
- Polarization > 80 at game end: "Hollow Republic" ending

### Policy Availability Windows

Many policies require polarization to be within a specific range. For example:
- The Blame Game requires polarization >= 40 (unavailable at game start where polarization is 25)
- Constitutional Amendment requires polarization <= 60 (impossible in a deeply divided country)

---

## Interaction Matrix (Ripple Effects)

When a policy directly changes a bloc's loyalty, secondary ripple effects propagate to allied and rival blocs. These represent how factions react to changes in their allies' or opponents' fortunes.

### How Ripples Work

Each bloc has defined alliance/rivalry coefficients with other blocs (range: -1.0 to +1.0). When a primary loyalty change hits a bloc, every allied/rival bloc receives a secondary change at **25% scale**.

Formula: `rippleDelta = round(primaryLoyaltyDelta * coefficient * 0.25)`

Ripples do NOT apply to blocs that already received a direct effect from the same policy (no double-dipping).

### Key Relationships

Strong alliances (positive coefficients):
- Banks <-> Big Tech (0.6)
- Generals <-> Enforcers (0.6)
- Factories <-> Unions (0.5)
- Scholars <-> Artists (0.5)
- Clergy <-> Main Street (0.4)

Strong rivalries (negative coefficients):
- Banks <-> Unions (-0.7)
- Big Tech <-> Unions (-0.6)
- Artists <-> Clergy (-0.6)
- Enforcers <-> Underworld (-0.5)
- Court <-> Underworld (-0.5)

---

## Discovery and Scandal

Backroom policies carry a risk of being exposed. Each has a discovery chance and a delay.

### Mechanics

1. When a backroom policy is used, a random roll is made against the discovery chance.
2. If the roll succeeds, the discovery is queued with a countdown (delay in turns).
3. Each turn, all pending discoveries tick down. When a discovery reaches 0, the scandal fires.
4. Scandal effects typically include: Court and Heralds loyalty drops, legitimacy and narrative losses, and rival power gains.

### Mitigation

- **Underworld loyalty > 60**: Discovery chance is halved (50% reduction). This represents the Underworld's ability to cover tracks.
- High Underworld loyalty also gives a 30% cost discount on backroom policies.

### Connection to Crisis Chains

Having any pending discoveries is one of the trigger conditions for the Media Scandal crisis chain.

---

## Events

Events are narrative moments that introduce external pressures and player choices. There are 40+ events in the pool.

### Event Types by Trigger

| Trigger Type | How It Works |
|---|---|
| **rival_threshold** | Fires when rival power crosses a specific level (30, 50, 60, 70, 85, 95). Priority over other events. |
| **loyalty_threshold** | Fires when a bloc's loyalty drops below (or rises above) a threshold. Checked during news phase and end phase. |
| **resource_threshold** | Fires when a resource crosses a threshold (e.g., Colossus alignment > 70). |
| **random** | Has a weight value. Probability = weight/20 per turn. Subject to additional conditions. |

### Event Resolution

- Events with **choices**: The player picks one option, each with different effects.
- Events with **autoEffects** only: Resolve automatically with no player input.
- **oneShot** events fire only once per game. Non-oneShot events (like loyalty threshold events) can fire repeatedly.

### Event Priority

When multiple events are eligible in one turn: rival threshold events > loyalty threshold events > random events. Only one event fires per turn (plus any crisis chain events in the queue).

---

## Crisis Chains

Crisis chains are multi-stage escalating emergencies that unfold over consecutive turns.

### Active Chains

| Chain | Trigger | Stages |
|---|---|---|
| **Banking Crisis** | Inflation > 18 | Bank Run Rumors -> Credit Freeze -> Banking Resolution |
| **Military Restlessness** | Generals loyalty < 25 | Barracks Rumors -> Officers' Ultimatum -> The Loyalty Question |
| **Labor Uprising** | Union loyalty < 20 AND cohesion > 60 | Rolling Strikes -> General Shutdown |
| **Media Scandal** | Pending discoveries exist OR Heralds loyalty < 35 | The Leak -> Investigation -> Verdict |
| **Colossus Pressure** | Colossus patience < 20 | Diplomatic Warning -> Sanctions -> Ultimatum |

### How Chains Work

1. When trigger conditions are met during the Reaction phase, the chain's first stage fires.
2. Each subsequent turn, the next stage fires automatically.
3. Events with player choices are queued and shown in the next turn's News phase.
4. Events without choices auto-resolve immediately.
5. Chains are one-shot... once the first stage fires, the chain won't re-trigger.

---

## Win and Loss Conditions

### Immediate Loss Conditions (checked every turn)

| Condition | Ending |
|---|---|
| Legitimacy reaches 0 | **Impeached** -- "The republic remembers who you were." |
| Generals loyalty < 20 AND dread > threshold* | **Coup** -- "The generals moved at dawn." |
| Rival power reaches 100 | **Rival Wins** -- "Democracy works. Sometimes against you." |

*Coup dread threshold varies by difficulty: Story = 85, Standard = 70, Crisis = 60.

### End-of-Term Conditions (turn 48, checked in priority order)

| Priority | Condition | Ending |
|---|---|---|
| 1 | Labor cohesion >= 80, rival < 30, narrative > 70 | **New Compact** (secret best ending) -- "A nation rebuilt from the bottom up." |
| 2 | Rival < 20, narrative > 60 | **A New Story** -- "The story they'll tell is the one you wrote." |
| 3 | Rival < 20, labor cohesion < 25 | **Manager's Victory** -- "The trains run on time. The workers run on fumes." |
| 4 | Underworld loyalty > 80 | **Shadow Republic** -- "The state works. Nobody asks who it works for." |
| 5 | Colossus alignment > 85 | **Protectorate** -- "Miranda is independent. The Colossus just makes the decisions." |
| 6 | Polarization > 80 | **Hollow Republic** -- "The institutions stand. Nobody's inside them." |
| 7 | Legitimacy > 30 | **Republic Endures** (default survival) -- "Not a victory. A continuation." |
| 8 | Otherwise | **Impeached** |

---

## Difficulty Settings

Three difficulty levels affect starting conditions and ongoing mechanics.

| Parameter | Story | Standard | Crisis |
|---|---|---|---|
| Rival growth multiplier | 0.15x | 1.0x | 1.5x |
| Base capital income/turn | 10 | 5 | 3 |
| Starting capital bonus | +80 | 0 | -30 |
| Starting legitimacy bonus | +20 | 0 | -10 |
| Legitimacy decay shield | 3/turn | 0 | 0 |
| Coup dread threshold | 85 | 70 | 60 |

**Story mode** is designed for exploring the narrative with minimal mechanical pressure. The rival barely grows, resources are abundant, and legitimacy is protected.

**Standard mode** is the intended experience with meaningful challenge.

**Crisis mode** is a harder variant where the rival grows 50% faster, resources are scarce, and coups trigger more easily.

---

## Design Rationale

### Core Design Philosophy

Miranda Republic is a systems-first political simulation. Its genre reference points are grand strategy and management simulation, filtered through satirical political commentary. The aesthetic is "dark whimsy" with an irreverent tone.

Miranda is a "synthetic republic" that mirrors tensions across multiple real-world democracies (Americas, Europe) without being locked to any single country. The game's setting exists in the shadow of an imperial neighbor (the Colossus), creating structural constraints on sovereignty that shape every decision.

The game avoids simple ideological binaries. Instead, it models how material conditions, cultural narratives, institutional inertia, and external pressures interact to produce political outcomes. The player should feel the structural limits of reform, not just pick sides.

### The Rival as Symptom, Not Cause

The rival's rise is designed as a **symptom of systemic failure**. Material conditions (inequality, precarity, institutional decay, imperial dependency) are the underlying engine. The rival channels real grievances through spectacle and scapegoating. This is why rival growth is driven by the player's weaknesses (inflation, low legitimacy, polarization) rather than by the rival's own actions. The player can suppress the rival, but until they address root causes, new grievances will fuel continued opposition.

The rival gains +1 power per turn even with perfect governance. This represents structural political opposition inherent to any democratic system. The player can slow or suppress growth but never eliminate it entirely. Every game has a ticking clock.

### Why Centrist Policies Get More Expensive

As polarization rises, the political center becomes harder to maintain. This models how compromise becomes politically costly in divided societies. The mechanic creates a feedback loop: polarizing actions are cheap and effective in the short term, but they make future compromise harder and more expensive.

At high polarization, centrist policies don't disappear, they become expensive and risky (backlash). But backroom versions of moderate governance remain accessible. This encodes a real dynamic: in highly polarized environments, moderate governance doesn't stop, it just moves underground and becomes corrupt. The player faces a genuine dilemma: pay the enormous political cost of centrist policy in public, or achieve the same outcome through backroom deals and risk scandal.

### Why Backroom Deals Are Risky But Useful

Backroom policies bypass congressional costs and sensitivity scaling, making them the most direct way to shift bloc loyalty. But the discovery mechanic creates delayed accountability. This models the trade-off between expedient governance and institutional integrity.

Corruption in Miranda isn't just a moral failure. It's a structural lubricant that smooths institutional friction. The player should sometimes face situations where a backroom deal is the only practical way to achieve a beneficial outcome. The game doesn't moralize about this choice; it simulates the consequences.

### Why Some Actions Are Locked

- **The Blame Game** (requires polarization >= 40): Scapegoating only works when society is already somewhat divided. In calm times, it would fall flat.
- **Informal Channels** (requires Underworld loyalty >= 40): The Underworld won't cooperate until they trust you. You need to build that relationship through other means first. The Underworld starts at 35 loyalty, just below the threshold, creating an early strategic question.
- **Constitutional Amendment / Electoral Reform** (requires majority): Major institutional changes require legislative support. You can't reform the system without first building a coalition within it.

### Why Narrative Is Slow to Build

The asymmetry (gains of +1 to +3 vs losses of -2 to -8) models how public trust is hard to earn and easy to lose. This makes investing in cultural blocs a long-term strategy rather than a quick fix. A single scandal can undo months of careful narrative work.

### Legitimacy vs. Narrative as Separate Dimensions

These two resources create fundamentally different strategic positions:

- **High Legitimacy + High Narrative**: Rare and powerful. Governing effectively and culturally ascendant.
- **High Legitimacy + Low Narrative**: "The Caretaker." Governing legally but nobody believes in your project. Technocratic inertia.
- **Low Legitimacy + High Narrative**: "The Revolutionary." Everyone loves your vision but institutions are blocking you. One scandal from impeachment.
- **Low Legitimacy + Low Narrative**: Crisis mode. The rival barely needs to campaign.

### Why Labor Cohesion Is Hidden

Labor cohesion operates as a structural variable that the player influences indirectly through policies and events. Making it visible would reduce it to a number to optimize. Keeping it hidden encourages the player to think about the conditions that build or erode worker solidarity rather than targeting a metric. The player sees the Unions' power fluctuate and must learn through play what strengthens or weakens organized labor.

The labor cohesion system models the fragmentation of the contemporary working class through de-industrialization, platform capitalism, and geographic divides. Traditional labor organizing no longer works on its own. Platform worker protections have conditional effects. whether they help or hurt cohesion depends on whether unions have built enough trust and whether the public narrative supports collective frameworks. You can't just legislate solidarity. You have to build the conditions that make it viable.

### Why the Dual Sensitivity System Exists

Rather than a single "media weight" axis, each bloc has separate material and narrative sensitivity scores. This reflects that every faction has both material interests and narrative susceptibility, and these are not inversely related. The Clergy runs schools, charities, and real estate (material) while also being deeply responsive to values rhetoric (narrative). The Enforcers care about budgets (material) but are also heavily swayed by "law and order" framing (narrative). The Underworld, uniquely, is almost purely transactional (material 90, narrative 10).

This means rhetoric alone can't secure a bloc if their material needs are unmet, and policy alone won't move blocs that are also narrative-sensitive. Different factions require different strategic mixes.

### Why the Interaction Matrix Exists

Ripple effects prevent the player from treating blocs as independent dials. Helping one faction affects its allies and rivals, creating realistic second-order consequences. A +20 loyalty boost to Unions doesn't just help the Unions; it sends -3 or -4 to the Banks (via the -0.7 rivalry coefficient at 25% scale).

The matrix encodes natural coalitions (Banks-Tech-Landowners as "global capital," Factories-Unions as "the old industrial compact," Generals-Enforcers-Clergy as "the order coalition," Unions-Artists-Scholars as "the progress coalition") while leaving room for unlikely alliances forced by circumstances. The Heralds and Main Street function as swing blocs, responsive to whoever controls the narrative or addresses their material anxieties. The Underworld is a wildcard with no natural coalition, allying with whoever is useful and non-threatening.

### Why the Underworld Exists

The Underworld represents organized informal power in territories the state has abandoned or never reached. They are not simply antagonists. They fill governance vacuums, providing security, employment, social services, and dispute resolution where formal institutions fail. This is why their ideology is 0 (purely transactional) and their narrative sensitivity is near-zero. They don't care about your speeches. They care about whether you'll leave them alone.

The Underworld creates a unique strategic layer. They are the ultimate backroom ally, able to deliver votes, smooth logistics, and suppress opposition. The cost: legitimacy erosion and the ever-present risk that any exposed connection destroys your narrative.

### Why the Colossus Is a Structural Constraint

The Colossus isn't an optional context. it's the structural framework that makes Miranda's "sovereignty" partially conditional. Trade dependency, debt, alignment pressures, and patience mechanics model how external imperial relationships constrain domestic policy options. The player can pursue independence, but it comes with real economic costs. Alignment with the Colossus brings stability and capital, but at the price of domestic industry, intellectual independence, and sovereignty.

### Why There Are 10 Endings

Multiple endings reward different play styles and prevent a single "correct" strategy:

- **New Compact** (secret best ending) requires investing in labor cohesion, controlling the rival, and maintaining narrative. This demands sustained, coherent policy-making rather than reactive crisis management.
- **A New Story** rewards narrative and rival control without requiring labor cohesion.
- **Manager's Victory** shows the cost of defeating the rival through institutions alone, without building worker solidarity.
- **Shadow Republic**, **Protectorate**, and **Hollow Republic** are "Pyrrhic survival" endings. you survived, but at what cost?
- **Republic Endures** is the default survival. Not a victory, a continuation.
- The three loss conditions (Impeached, Coup, Rival Wins) represent different modes of failure.

The endings collectively pose the question: "What does it mean to govern? And for whom?"

---

## Changelog

### v1.0 (February 2026)
- Initial documentation of all game mechanics
- Engine through Phase 6 complete (46 policies, 14 blocs, 5 crisis chains, 10 endings)
- Rival personality system with 4 backgrounds and context-aware action text
- Congressional mechanics with seat shares and majority effects
- Central bank independence as a hidden strategic lever
- 40+ events including random, threshold-triggered, and crisis chain events
