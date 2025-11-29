import { H2, H3, P } from "@/app/_components";
import ChessMinigame from "@/app/_components/chessboard/ChessMinigame";
import Highlight from "@/app/_components/text/Highlight";
import Section from "@/app/_components/text/Section";

function ResultsDiscussion() {
  return (
    <Section title="Results and Discussion" icon="🎯">
      <H2 text="Limitations" />
      <div className="space-y-3">
        <H3 text="ELO Distribution" />
        <P>
          The LiChess dataset does not contain many games outside of the{" "}
          <b>1500</b> to
          <b>2700</b> range. As the vast majority of players — around <b>95%</b>{" "}
          of the population — have a rating outside of this range, the data may
          not be a complete and accurate representation of the range’s actual
          opening demographic. As a result, individuals with lower skillsets are
          less likely to benefit directly from studying these games, since the
          nuances of some positions may not translate well into their level of
          play.{" "}
        </P>
        <P>
          That said, if you're rated below <b>1500</b> or simply curious about
          advanced play, the Opening Explorer still offers valuable insights
          into high-level strategies and their frequency of use.
        </P>
      </div>

      <div className="space-y-3">
        <H3 text="Human Error" />
        <P>
          Unlike chess engines such as <Highlight text="Stockfish" />, human
          players cannot play perfectly. There are two general types of these
          mistakes that may affect this dataset:
        </P>
        <P>
          <b>Abnormal/Subtle Blunders:</b> This includes tactical oversights
          such as hanging a queen or missing checkmate. Additionally, subtle
          changes in positioning may also accumulate to an unexpected loss
          despite an advantage in the opening. These errors create
          inconsistencies in the performance of different openings, leading to
          an inaccurate assessment of an opening’s true value in the game.
        </P>
        <P>
          <b>Time Control: </b> Time control was excluded from this analysis
          since this report focuses on openings and not the entire game.
          However, in shorter time formats such as a <Highlight text="blitz" />{" "}
          or <Highlight text="bullet" />, the pressure from the time constraints
          may lead to lower quality play in the mid or end game. This means that
          players can sometimes run out of time before they are able to complete
          their game. A clear instance of this can come from a position like
          this:
        </P>
      </div>

      <div>
        <ChessMinigame />
      </div>

      <P>
        This position is a guaranteed mate in <b>38</b> for white if played
        correctly. While theoretically possible to execute, a combination of the
        time pressure and the difficulty of the position means that the game
        will likely end in a draw if there is a limited amount of time for
        white. This illustrates how shorter time controls can impact this
        dataset, since it may cut games short despite having an almost
        guaranteed win otherwise.
      </P>

      <div className="space-y-3">
        <H2 text="Results and Conclusion" />
        <P>
          This report highlights the importance of openings in chess. They allow
          players to build opening roadmaps suitable to their own play style and
          ELO range, as well as enhance their own understanding of how the
          various pieces move and develop. Studying openings also allows players
          to gain the advantage early in the game, catching unsuspecting
          opponents off guard and at worst leading to a familiar midgame.
        </P>
        <P>
          Importantly, openings should be understood – not memorized. Many
          openings mentioned throughout this report have a unique goal that is
          only possible through their specific combination of moves.
          Understanding the approach of these openings enables the potential of
          other, similar openings through their development, central control,
          and mid-game mating tactics. Taking advantage of this knowledge will
          enhance a player's ability to adapt their opening and midgame plays to
          adapt to other, more prevalent openings in the metagame.
        </P>
      </div>
    </Section>
  );
}

export default ResultsDiscussion;
