import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tippy';

import 'react-tippy/dist/tippy.css';

import BungieImage from 'src/components/BungieImage';
import s from './styles.styl';

const NO_ICON = '/img/misc/missing_icon_d2.png';

const MEDAL_ICONS = {
  medalMulti2x: [
    '/common/destiny2_content/icons/c374539e93c937386ce11c9bf1cc5e8f.png'
  ],
  medalMulti3x: [
    '/common/destiny2_content/icons/f463fecb3575af3d40cfde866e855ccc.png'
  ],
  medalMulti4x: [
    '/common/destiny2_content/icons/1d48c4cd7014f46da799062af103e830.png',
    '/common/destiny2_content/icons/b9602daedf3e9712dba79ba0e1ac7584.png'
  ],
  medalMultiEntireTeam: [
    '/common/destiny2_content/icons/476d3f5d48761470e381817f01e21972.png'
  ],
  medalStreakCombined: [
    '/common/destiny2_content/icons/078e2a1e1ac1fbc83ac51158d654badf.png'
  ],
  medalStreak5x: [
    '/common/destiny2_content/icons/cc350056e3fc8d0c4e563b5404d839d0.png'
  ],
  medalStreak10x: [
    '/common/destiny2_content/icons/82b1cfcfda096b45d63e068b3186c7e1.png'
  ],
  medalStreakTeam: [
    '/common/destiny2_content/icons/f0bb0e5c57a8e3aff1c9e82c8ef78fd6.png'
  ],
  medalStreakShutdown: [
    '/common/destiny2_content/icons/55725510443afce19bd74c629602f3fa.png'
  ],
  medalStreakAbsurd: [
    '/common/destiny2_content/icons/7c86281f5358c61aade4179f099ee5fe.png'
  ],
  medalPayback: [
    '/common/destiny2_content/icons/2f6dceee7e0c95449278cc22e86a4d67.png'
  ],
  medalAvenger: [
    '/common/destiny2_content/icons/3be907a802bce601e9217fc47892ffa9.png'
  ],
  medalQuickStrike: [
    '/common/destiny2_content/icons/fc5da29597c52a15d27982e65217ee04.png'
  ],
  medalDefense: [
    '/common/destiny2_content/icons/4a1595d0d7d5bc5719e658d39f9e61d7.png',
    '/common/destiny2_content/icons/374691a3d45e9d1bf5000d8174c9a9d9.png'
  ],
  medalDefeatHunterDodge: [
    '/common/destiny2_content/icons/8ec73f881388dd345dec008dc5ba74b2.png'
  ],
  medalDefeatTitanBrace: [
    '/common/destiny2_content/icons/8d8a87deebe5d1d2769fd15111e56095.png'
  ],
  medalDefeatWarlockSigil: [
    '/common/destiny2_content/icons/12f86913f4ea37df496a61b6f27dbff6.png'
  ],
  medalCycle: [
    '/common/destiny2_content/icons/ff9bb48c9b2dc6dc0aae20d2cd919646.png'
  ],
  medalSuperShutdown: [
    '/common/destiny2_content/icons/a9f20e96905000eaab2bfee8af852d26.png'
  ],
  medalMatchNeverTrailed: [
    '/common/destiny2_content/icons/dd02b3c2c7359f3c56146f1ef72456a3.png'
  ],
  medalMatchComeback: [
    '/common/destiny2_content/icons/c7ee6d2436c0ad0cee4920b50670d587.png'
  ],
  medalMatchOvertime: [
    '/common/destiny2_content/icons/f81559bfc1ab87f6d0aef58c139479b3.png'
  ],
  medalMatchBlowout: [
    '/common/destiny2_content/icons/d857a53bef0aa0021f9c1896ff108b11.png'
  ],
  medalMatchMostDamage: [
    '/common/destiny2_content/icons/02fc9d72923d1a2023f01b66cfc1dffb.png'
  ],
  medalMatchUndefeated: [
    '/common/destiny2_content/icons/79e46b95c1f39799fdc0d2dd7ee78c13.png'
  ],
  medalAbilityDawnbladeSlam: [
    '/common/destiny2_content/icons/06c707ac96d6899b4c9fc8550612775f.png'
  ],
  medalAbilityDawnbladeAerial: [
    '/common/destiny2_content/icons/f5095f8f4e493507dfabdc87dba7e4af.png'
  ],
  medalAbilityVoidwalkerVortex: [
    '/common/destiny2_content/icons/d42167996498e3422db0ec5b5909dd1c.png'
  ],
  medalAbilityVoidwalkerDistance: [
    '/common/destiny2_content/icons/01b77c7bef570162296b80bd051c5ad9.png'
  ],
  medalAbilityStormcallerLandfall: [
    '/common/destiny2_content/icons/5441792b1b52ed314a7d265e20297df7.png',
    '/common/destiny2_content/icons/29d224c59debee78fca7737216979fda.png'
  ],
  medalAbilityStormcallerMulti: [
    '/common/destiny2_content/icons/779707030bc72b7208b9712feb32c2c4.png'
  ],
  medalAbilityFlowwalkerQuick: [
    '/common/destiny2_content/icons/cd0520da1b3c85a24ade6f1239df3da7.png'
  ],
  medalAbilityFlowwalkerMulti: [
    '/common/destiny2_content/icons/1e0b0052a441bfe8fb72967f26bb07df.png'
  ],
  medalAbilityGunslingerQuick: [
    '/common/destiny2_content/icons/f3c48347f3a6358c3a4c1a677173283c.png'
  ],
  medalAbilityGunslingerMulti: [
    '/common/destiny2_content/icons/3badd7d5468b0ea94e16240b2e1914c1.png'
  ],
  medalAbilityNightstalkerTetherQuick: [
    '/common/destiny2_content/icons/97d524dfe75bbee36aeea9cead4ef03d.png'
  ],
  medalAbilityNightstalkerLongRange: [
    '/common/destiny2_content/icons/7bac4b6a756979181a346455a325597b.png'
  ],
  medalAbilitySentinelWard: [
    '/common/destiny2_content/icons/9d8985db26a7b3714d29f7725085a3db.png'
  ],
  medalAbilitySentinelCombo: [
    '/common/destiny2_content/icons/5c560f01a6c338a6537e903330f9c73d.png'
  ],
  medalAbilityJuggernautSlam: [
    '/common/destiny2_content/icons/d70702909bf6ce51aff91eac84065abb.png'
  ],
  medalAbilityJuggernautCombo: [
    '/common/destiny2_content/icons/66f0695828dacb49f803aed9499bfed0.png'
  ],
  medalAbilitySunbreakerLongRange: [
    '/common/destiny2_content/icons/7fdb37420fcd3e2604c84a43713eb96c.png'
  ],
  medalAbilitySunbreakerMulti: [
    '/common/destiny2_content/icons/963ae046f77612d7887bc99f976748c2.png'
  ],
  medalWeaponAuto: [
    '/common/destiny2_content/icons/53fce72dd677eaf2152354341523b3b7.png'
  ],
  medalWeaponPulse: [
    '/common/destiny2_content/icons/e72c2a6f8d92a371b9485cf24ab34c2a.png'
  ],
  medalWeaponScout: [
    '/common/destiny2_content/icons/683aa771b3cb21c2377104546147887f.png'
  ],
  medalWeaponHandCannon: [
    '/common/destiny2_content/icons/62b931e9c69c96d3735ef86594bf93e3.png'
  ],
  medalWeaponSmg: [
    '/common/destiny2_content/icons/6223051766623f756cfc05b26dc4f761.png'
  ],
  medalWeaponSidearm: [
    '/common/destiny2_content/icons/6b4a570153f6f258f542007b228369ce.png'
  ],
  medalWeaponSniper: [
    '/common/destiny2_content/icons/d2a924422575767133ce1058926ec23b.png'
  ],
  medalWeaponFusion: [
    '/common/destiny2_content/icons/1448be641a8536728ee000c23e676cae.png'
  ],
  medalWeaponRocket: [
    '/common/destiny2_content/icons/88d3fc62b11a7ee37b54f3963f4f234d.png'
  ],
  medalWeaponGrenade: [
    '/common/destiny2_content/icons/948e228b2504c21458682e59c44d82f2.png'
  ],
  medalWeaponShotgun: [
    '/common/destiny2_content/icons/1d02ccec9dca0a0dcb58cdb185fc2c61.png'
  ],
  medalWeaponSword: [
    '/common/destiny2_content/icons/17ce0dd16876730342ebde313438a325.png',
    '/common/destiny2_content/icons/2e9677b0f406374caf119f742040dbf7.png'
  ],
  medalCountdownDefense: [
    '/common/destiny2_content/icons/ee0a4addb8d9b2ed70e7100609edd888.png'
  ],
  medalCountdownDetonated: [
    '/common/destiny2_content/icons/45e34f1a4b1d791878539097c015b7a3.png',
    '/common/destiny2_content/icons/1d48c4cd7014f46da799062af103e830.png'
  ],
  medalCountdownDefusedMulti: [
    '/common/destiny2_content/icons/eda6b9863ca64e9f12d319bc1eb82c5f.png'
  ],
  medalCountdownDefusedLastStand: [
    '/common/destiny2_content/icons/889cc47d39e53c6b1116b1ad6ffaef22.png'
  ],
  medalCountdownRoundAllAlive: [
    '/common/destiny2_content/icons/4733c5932f1212e1e84a256f187271ec.png'
  ],
  medalCountdownPerfect: [
    '/common/destiny2_content/icons/0b3fa0f551c38856fe5c9726aedd5c18.png'
  ],
  medalSurvivalWinLastStand: [
    '/common/destiny2_content/icons/5298ee9754e6aee133f3ad35db7dfb9f.png'
  ],
  medalSurvivalUndefeated: [
    '/common/destiny2_content/icons/ba61c4dd5f24a6943e3fdf389ab8ffac.png'
  ],
  medalSurvivalQuickWipe: [
    '/common/destiny2_content/icons/42aee484a1c7fa85eb3a34f706a83748.png'
  ],
  medalSurvivalKnockout: [
    '/common/destiny2_content/icons/21434a32c7fb77466c7ab571f0b6cfc6.png'
  ],
  medalSurvivalComeback: [
    '/common/destiny2_content/icons/3b8c06532f376ae9d6411ec431244c4a.png'
  ],
  medalSurvivalTeamUndefeated: [
    '/common/destiny2_content/icons/2b4d473ccb04338d564366eb88d29cef.png'
  ],
  medalControlPerimeterKill: [
    '/common/destiny2_content/icons/5d6bc48573116119e4e427cf941b502a.png'
  ],
  medalControlCaptureAllZones: [
    '/common/destiny2_content/icons/05ef3f35a24261327e56317d32564091.png'
  ],
  medalControlMostAdvantage: [
    '/common/destiny2_content/icons/10e1ddd610aaeea494b2be66252c0f56.png'
  ],
  medalControlAdvantageStreak: [
    '/common/destiny2_content/icons/e08bb9d3fc481bf909d13b40afec8f4b.png'
  ],
  medalControlPowerPlayWipe: [
    '/common/destiny2_content/icons/ca77d04a8296f3d9f3c2576885e80f0c.png'
  ],
  medalSupremacyFirstCrest: [
    '/common/destiny2_content/icons/30777d92aebb08ffbf4a1ee6b6d5f4a5.png'
  ],
  medalSupremacySecureStreak: [
    '/common/destiny2_content/icons/98a8a9930cec923893245ee630b2d81f.png'
  ],
  medalSupremacyRecoverStreak: [
    '/common/destiny2_content/icons/2d793f421d41eb711c5c3245af7d57fc.png'
  ],
  medalSupremacyNeverCollected: [
    '/common/destiny2_content/icons/f5cbae45f134e7e6599e32236698d983.png'
  ],
  medalSupremacyCrestCreditStreak: [
    '/common/destiny2_content/icons/8b9b91f67ab50c44a0f632a2a6d0d154.png'
  ],
  medalSupremacyPerfectSecureRate: [
    '/common/destiny2_content/icons/e6087269a98e15912c4d8faee317bce6.png'
  ],
  medalMayhemFirstSuper: [
    '/common/destiny2_content/icons/954f3dbad37b96f62fb956b3af6d8135.png'
  ],
  medalMayhemGrenadeStreak: [
    '/common/destiny2_content/icons/b11e4380b45d30625ddaa8ec3282d7d2.png'
  ],
  medalMayhemMeleeStreak: [
    '/common/destiny2_content/icons/8ea660afe997186230a3aa3646d2d8f6.png'
  ],
  medalMayhemCastStreak: [
    '/common/destiny2_content/icons/50347f5748d73a951abcb9d9c4e5ce85.png'
  ],
  medalMayhemCastMulti: [
    '/common/destiny2_content/icons/dc0518a27a294ecd41b4121b5b2b5a9d.png'
  ],
  medalMayhemKillStreak: [
    '/common/destiny2_content/icons/8a8bb18130a13e87d7c6d6c369bd9879.png'
  ],
  medalRumbleDefeatAllClasses: [
    '/common/destiny2_content/icons/115c505b355c83c58ef8024df186397f.png'
  ],
  medalRumbleUnassistedStreak: [
    '/common/destiny2_content/icons/912daa8fd44c80bb6b67e5e98135851b.png'
  ],
  medalRumbleStealStreak: [
    '/common/destiny2_content/icons/d3244ef22998553024ef7d96039698ff.png'
  ],
  medalRumbleTop3: [
    '/common/destiny2_content/icons/8a1b922922db5b8aefa43d06f30aefc9.png'
  ],
  medalRumbleDefeatAllPlayers: [
    '/common/destiny2_content/icons/95063998ca1c61f0388a03cc97b89498.png'
  ],
  medalRumbleBetterThanAllCombined: [
    '/common/destiny2_content/icons/48211cd7c2f3faccfcc4d4c8a22b1773.png'
  ],
  medalSlayer: [
    '/common/destiny2_content/icons/a9a46942a85df576cc078ebd79d5ca13.png'
  ],
  medalStreak6x: [
    '/common/destiny2_content/icons/88c897a8768953cf81c347e58af62588.png'
  ],
  medalStreak7x: [
    '/common/destiny2_content/icons/7dfe3021df3d9e3bebc726a3ca913f67.png'
  ],
  medalShowdownMostKills: [
    '/common/destiny2_content/icons/d8a7b871614fd1ee1f1f8a2e8ad84ecd.png'
  ],
  medalShowdownAmmoStreak: [
    '/common/destiny2_content/icons/2c0029b99f366512d0e4fff581430e8d.png'
  ],
  medalShowdownRetakeLead: [
    '/common/destiny2_content/icons/b8276501d42f00d802485dc47949c42b.png'
  ],
  medalShowdownFullTeamSurvival: [
    '/common/destiny2_content/icons/8cbc082e7c3ef078038c83ae800c249d.png'
  ],
  medalShowdownForceFinalRound: [
    '/common/destiny2_content/icons/b8da105a74f544c08ad6b2f4746747be.png'
  ],
  medalShowdownUndefeated: [
    '/common/destiny2_content/icons/2bcce418452303573ebe7289a99fdb4b.png'
  ],
  medals_pvecomp_medal_invader_kill_four: [
    '/common/destiny2_content/icons/7c293d3cf3383090c63444ab533f44a7.png'
  ],
  medals_pvecomp_medal_massacre: [
    '/common/destiny2_content/icons/f8627eb748a612a8ecb14480f57846bb.png'
  ],
  medals_pvecomp_medal_no_escape: [
    '/common/destiny2_content/icons/4ca0f052f8d48b2974c6dc4b38da33bc.png'
  ],
  medals_pvecomp_medal_blockbuster: [
    '/common/destiny2_content/icons/8130f1b42238775655f5ee3eeb05466b.png'
  ],
  medals_pvecomp_medal_tags_denied_15: [
    '/common/destiny2_content/icons/58b906023820d6d9b70e3fdc87e3da12.png'
  ],
  medals_pvecomp_medal_denied: [
    '/common/destiny2_content/icons/55480467fec92c29abacb142e48a9e70.png'
  ],
  medals_pvecomp_medal_invasion_shutdown: [
    '/common/destiny2_content/icons/4a1595d0d7d5bc5719e658d39f9e61d7.png'
  ],
  medals_pvecomp_medal_locksmith: [
    '/common/destiny2_content/icons/4c65ce43d6d231c10047f52e24c8fe35.png'
  ],
  medals_pvecomp_medal_block_party: [
    '/common/destiny2_content/icons/eb07e01dc74672233b60f5b06c21f347.png'
  ],
  medals_pvecomp_medal_never_say_die: [
    '/common/destiny2_content/icons/cb940057c681d645494ef6b8877d8564.png'
  ],
  medals_pvecomp_medal_half_banked: [
    '/common/destiny2_content/icons/2af71a15dac43a7460f0fa44e24c1c19.png'
  ],
  medals_pvecomp_medal_everyone_invaded: [
    '/common/destiny2_content/icons/edcec8ca971526fa713369df44f8bd4c.png'
  ],
  medals_pvecomp_medal_killmonger: [
    '/common/destiny2_content/icons/a0ca84db8e13ac548b0abee81690ca1d.png'
  ],
  medals_pvecomp_medal_thrillmonger: [
    '/common/destiny2_content/icons/6db4ec34dbe399ee440b9081d9be2fbb.png'
  ],
  medals_pvecomp_medal_overkillmonger: [
    '/common/destiny2_content/icons/97263c6dc4bb148ed9fbc041ea6e575c.png'
  ],
  medals_pvecomp_medal_first_to_block: [
    '/common/destiny2_content/icons/d3f4193ce741ca69dc03bce8d6b327c0.png'
  ],
  medals_pvecomp_medal_fast_fill: [
    '/common/destiny2_content/icons/b89c86d6e22c001bda0affffbfe8197c.png'
  ],
  medals_pvecomp_medal_big_game_hunter: [
    '/common/destiny2_content/icons/01c39d2d3ca5edfeb5278d7757d91d4b.png'
  ],
  medals_pvecomp_medal_revenge: [
    '/common/destiny2_content/icons/d2ca1e3e61d03ed23a0d54c63b58982b.png'
  ],
  medals_pvecomp_medal_revenge_same_invasion: [
    '/common/destiny2_content/icons/de7f656b524362a00eb7b7e78f13956f.png'
  ],
  medals_pvecomp_medal_fist_of_havoc_multikill: [
    '/common/destiny2_content/icons/642958c2bab8e3be97df359970392193.png'
  ],
  medals_pvecomp_medal_meteor_strike_multikill: [
    '/common/destiny2_content/icons/6fe9eefd10afa0874b646716fe350cc4.png'
  ],
  medals_pvecomp_medal_void_shield_multikill: [
    '/common/destiny2_content/icons/5c483871942ac65633ad9740d6faeae6.png'
  ],
  medals_pvecomp_medal_thermal_hammer_multikill: [
    '/common/destiny2_content/icons/f94fc2a2c323da069a5996b165338e06.png'
  ],
  medals_pvecomp_medal_thermal_maul_multikill: [
    '/common/destiny2_content/icons/5b37b328a79a1d19b581a4e9cd8d17cc.png'
  ],
  medals_pvecomp_medal_arc_staff_multikill: [
    '/common/destiny2_content/icons/f366494f5dae1b18d92de538fbe0ab81.png'
  ],
  medals_pvecomp_medal_golden_gun_multikill: [
    '/common/destiny2_content/icons/6afb3f5c8026cdf1ae42b0b2fcd93772.png'
  ],
  medals_pvecomp_medal_thermal_knives_multikill: [
    '/common/destiny2_content/icons/105534d279197ae5d981a4407a5a2e84.png'
  ],
  medals_pvecomp_medal_void_blade_multikill: [
    '/common/destiny2_content/icons/bf0d2948268f541c4bfe0f38e4a8f021.png'
  ],
  medals_pvecomp_medal_void_bow_multikill: [
    '/common/destiny2_content/icons/6d709d478b4534af7a66454be77dad5f.png'
  ],
  medals_pvecomp_medal_arc_lightning_multikill: [
    '/common/destiny2_content/icons/d26ea0809bade87ce9a211e8e5f68848.png'
  ],
  medals_pvecomp_medal_arc_beam_multikill: [
    '/common/destiny2_content/icons/eb33711683a0ff49072ae205b3918ce0.png'
  ],
  medals_pvecomp_medal_nova_bomb_multikill: [
    '/common/destiny2_content/icons/acab9d0c62ca2e9c0233fa08b2e70986.png'
  ],
  medals_pvecomp_medal_nova_pulse_multikill: [
    '/common/destiny2_content/icons/e20b30c5bf2bd9f95a6cde6f50148a22.png'
  ],
  medals_pvecomp_medal_thermal_sword_multikill: [
    '/common/destiny2_content/icons/1ee7e4cc0cd46f15eed43945809d181d.png'
  ],
  Medals_pvecomp_medal_thermal_sword_healing_multikill: [
    '/common/destiny2_content/icons/f337bfed4fed952d15f6fb7d28987450.png'
  ]
};

if (false) {
  const defs = {};

  Object.values(defs.DestinyHistoricalStatsDefinition)
    .map(statDef => ({
      statDef,
      records: Object.values(defs.DestinyRecordDefinition).filter(
        r => r.displayProperties.name === statDef.statName
      )
    }))
    .filter(({ records }) => records.length > 0)
    .reduce((acc, d) => {
      return {
        ...acc,
        [d.statDef.statId]: d.records.map(r => r.displayProperties.icon)
      };
    }, {});
}

function Medal({ statDef, count, className }) {
  const statId = statDef && statDef.statId;
  const icon =
    (statDef && statDef.iconImage) ||
    (MEDAL_ICONS[statId] && MEDAL_ICONS[statId][0]) ||
    NO_ICON;

  return (
    <Tooltip
      html={
        <Fragment>
          <div className={s.name}>{statDef.statName}</div>
          <div className={s.description}>{statDef.statDescription}</div>
        </Fragment>
      }
      position="top"
      arrow
      followCursor
    >
      <div className={s.root}>
        <BungieImage className={s.icon} src={icon} />

        {count > 1 && <div className={s.badge}>{count}</div>}
      </div>
    </Tooltip>
  );
}

const mapStateToProps = (state, ownProps) => ({});

export default connect(mapStateToProps)(Medal);
