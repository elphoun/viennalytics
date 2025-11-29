import { H2, H3, P } from "@/app/_components";
import ChessOpeningClusters from "@/app/_components/graphs/ChessOpeningClusters";
import MovePairMatchupAnalysis from "@/app/_components/graphs/MovePairMatchupAnalysis";
import OpeningEvalBoxPlot from "@/app/_components/graphs/OpeningEvalBoxPlot";
import Highlight from "@/app/_components/text/Highlight";
import Section from "@/app/_components/text/Section";
import ImageDisplay from "@/app/_components/ui/ImageDisplay";
import { memo } from "react";

const Topic2 = memo(() => {
  return (
    <Section title="Topic 2: Analysis of Move Pairs" icon="🎯">
      <P>
        In 1561, Ruy Lopez published the book{" "}
        <Highlight
          text={
            <i>Libro de la invención liberal y arte del juego del axedrez</i>
          }
        />{" "}
        (The Art of the Game of Chess). His book discussed the basics of
        openings and development, as well as introducing to the chess world the
        importance of
        <Highlight text="central control" />. These efforts led to an opening
        being named after him that capitalizes on these ideas, also known as the{" "}
        <Highlight text="Spanish Game." />
      </P>

      <div className="flex flex-col lg:flex-row gap-5 w-full items-center justify-center">
        <ImageDisplay
          src="/artofchess.jpg"
          caption={
            <>
              <Highlight text="Libro de la invención liberal y arte del juego del axedrez" />
              <br />
              (The Art of the Game of Chess).
            </>
          }
          width={135}
          height={250}
        />
        <ImageDisplay
          src="/ruylopez.png"
          caption={
            <>
              <Highlight text="Ruy Lopez (Spanish Game)" />
              <br />
              <Highlight text="1.e4 e5 2.Nf3 Nc6 3.Bb5" />
            </>
          }
          width={250}
          height={250}
        />
      </div>

      <P>
        In the modern chess world, these ideas have been developed into what are
        known as the <Highlight text="chess principles" />. A few key ones that
        will be discussed here are{" "}
        <Highlight text={<b>Controlling the Center</b>} />,{" "}
        <Highlight text={<b>A Knight on the Rim is Dim</b>} />, and{" "}
        <Highlight text={<b>Developing your Pieces Quickly</b>} />. These
        principles will be used to analyze how different openings and their
        leading moves lead to different outcomes within games.
      </P>

      <H2 text="Methodolgy" />
      <P>
        After compiling each of the games, I extracted the data for each opening
        and compiled the data into four graphs, each analyzing a unique aspect
        of the dataset with respect to move pairs:
      </P>
      <ChessOpeningClusters />
      <OpeningEvalBoxPlot />
      <MovePairMatchupAnalysis />

      <H2 text="Analysis Results" />
      <H3 text="White VS Black" />
      <P>
        One of the few consensus’ among chess players is that{" "}
        <Highlight text="white has the advantage over black" />. Since white
        always moves first, they prefer to attack sooner so that they are able
        to control the center of the board. This enables development of key
        pieces like their bishops or queen, allowing them to attack black before
        they are prepared. On the other hand, black moves second, so they prefer
        to remain defensive and maintain a reactionary play style by
        counterattacking instead of pushing at a disadvantage.{" "}
      </P>
      <P>
        The k-means analysis reinforces this idea since it shows a strong bias
        towards the white openings. <b>511</b> openings are either white
        advantaged or white leaning, compared to <b>184</b> openings which are
        only black leaning. While the majority of the openings still give both
        sides a fighting chance, the first-move advantage of White means that
        the majority of openings are still white biased. These results support
        the consensus that the majority of the chess playerbase has.{" "}
      </P>

      <H3 text="Common Trends" />
      <P>
        Typically, active moves that are closer to the center of the board tend
        to have more balanced win rates for white. A clear example of this trend
        is that pawn moves on the 4th rank (i.e. <Highlight text="e4" />,{" "}
        <Highlight text="d4" />) tend to perform stronger than their 3rd rank
        counterparts (i.e. <Highlight text="e3" />, <Highlight text="e4" />) by{" "}
        <b>1.2%</b> (<b>52.4%</b> vs <b>51.2%</b> winrate). On the other hand,
        defensive moves for black on the 5th rank (i.e. <Highlight text="e5" />,{" "}
        <Highlight text="d5" />) tend to perform stronger than their 6th rank
        counterparts (i.e. <Highlight text="e6" />, <Highlight text="d6" />) by{" "}
        <b>0.5%</b>.
      </P>
      <P>
        While the margin isn’t large on average, the range on the average win
        rates for each opening is much higher. For instance, the 4th rank pawn
        moves have a range of <b>23.1%</b> from <b>43.6%</b> on{" "}
        <Highlight text="g4" /> to <b>66.7%</b> on <Highlight text="c4" />,
        while the 3rd rank pawn moves have a range of <b>2.6%</b> from{" "}
        <b>50%</b> on b3 to a <b>52.6%</b> winrate on g3. This suggests that
        when played correctly, the openings that take advantage of the correct
        rank have much higher win rates compared to the ones that do not.{" "}
      </P>
      <P>
        A common trend among knight moves is that they tend to outperform most
        of the pawn moves. This is particularly true for white, where{" "}
        <Highlight text="Nc3" /> has by far the highest win rate at <b>54.8%</b>{" "}
        out of any of the opening moves. In a similar vein to why white prefers
        taking the offense, knight moves allow both players to develop a strong
        piece while also strengthening their defensive capabilities. This can
        lead to stronger midgame positioning with development and pawn
        structures since they are stronger as supportive pieces rather than
        offensive ones.{" "}
      </P>

      <H3 text="Evaluations at the Game's Opening" />
      <P>
        Despite the variance in performance for black and white in the matchup
        charts, something that is relatively constant between the two sides and
        the positions are the <Highlight text="opening evaluation scores" />.
        These values were determined by taking the evaluation of the opening
        position once it has been played.{" "}
      </P>
      <P>
        While white has the most number of wins at <b>28492</b> compared to{" "}
        <b>22887</b> for black, they share similar medians (<b>27</b> vs{" "}
        <b>29</b> centipawns) and quartiles. Their ranges are even the exact
        same from <b>-278.0</b> to <b>198.0</b> centipawns. This stability
        occurs because statistically, the majority of the matches are played on
        an opening that favors white. This suggests that while there is likely a
        minor correlation between the opening evaluation and the result of the
        match, what's ultimately more important for the majority of games is the
        rest of the games where blunders and mistakes are more common.
      </P>
      <P>
        Additionally, the equal skew likely suggests that common openings like
        the <Highlight text="Vienna" /> or <Highlight text="Caro-Kann" /> have
        comparatively more equal openings. The majority of the openings are
        concentrated towards the center with no outliers in the outer quartiles,
        leading to a wider band in the center and a much thinner band on the
        outer quartiles. This reinforces the idea that common openings – such as
        the Vienna at <b>14</b> or the Caro-Kann at <b>22</b> – tend to have
        more balanced positions. On the other hand, nicher openings like the{" "}
        <Highlight text="Englund Gambit" /> at <b>145</b> might have more
        erratic values, leading to more significant advantages in the midgame.
      </P>
    </Section>
  );
});

Topic2.displayName = "Topic2";

export default Topic2;
