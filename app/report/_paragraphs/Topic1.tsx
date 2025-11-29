import { memo } from "react";
import { P, H2, CodeBlock } from "@/app/_components";
import Section from "@/app/_components/text/Section";
import Hyperlink from "@/app/_components/text/Hyperlink";
import Highlight from "@/app/_components/text/Highlight";
import Quote from "@/app/_components/text/Quote";
import ImageDisplay from "@/app/_components/ui/ImageDisplay";
import EloDistributionByOpening from "../../_components/graphs/EloDistributionByOpening";

const Topic1 = memo(() => {
  return (
    <Section
      title="Topic 1: How does ELO Influence an Opening's Usage Rates?"
      icon="♟️"
    >
      <Quote
        quote="The game of the gods. Infinite possibilities."
        author="Vladimir Nabokov (The Defense, 1929)"
      />

      <div className="space-y-6">
        <div className="space-y-3">
          <H2 text="Introduction" />
          <P>
            One of the biggest differences between a high and low ranked chess
            player is how well they can understand the theoretical possibilities
            behind their moves. Higher ELO players don't just memorize their
            lines; they anticipate their opponents moves and adjust their play
            accordingly. They understand the strategy and potential behind each
            of the moves and their positional advantages.
          </P>

          <P>
            This concept is no different for openings. For example, the{" "}
            <Hyperlink link="https://www.chess.com/openings/Scandinavian-Defense">
              <Highlight text="Scandinavian" />
            </Hyperlink>{" "}
            is a theoretical, counter-intuitive opening where black sacrifices a
            pawn on the first turn to white. Despite this, it is an extremely
            strong opening that counters white's most common opening:{" "}
            <Highlight text="e4" />. Take the following game as an example:
          </P>

          <iframe
            id="13652316"
            title="13652316"
            className="flex-1 min-h-110"
            style={{ width: "100%", border: "none" }}
            src="https://www.chess.com/emboard?id=13652316"
          />

          <P>
            White opens the game with the standard move e4. Black then responds
            with d5, seemingly giving up their pawn. However, black is able to
            gain positional advantage since after the two sides trade away their
            piece, they can bring out their light-squared bishop to pin the f3
            knight to the queen. This pressures the d4 pawn since their d4 pawn
            is now vulnerable to the black queen once the f3 knight moves away.
            Taking advantage of this situation, black is able to end the game
            with a win by resignation on turn <strong>29</strong>.
          </P>

          <P>
            While these types of openings – known as{" "}
            <Highlight text="theoretical openings" /> – rarely follow the
            player's intuitive understanding of the game, they begin to make
            sense as they become more accustomed to the importance of positional
            advantages. Higher ELO players are able to take advantage of this
            understanding and play their openings with a specific end or midgame
            in mind, and thus bring their opponent into territory that only they
            are familiar with. This section will analyze how different openings
            and ELO ranges correlated in terms of success and usage rates.
          </P>
        </div>

        <div className="space-y-3">
          <H2 text="Methodology" />
          <P>
            After compiling each of the games, I extracted the{" "}
            <Highlight text="elo" /> and the{" "}
            <Highlight text="name of the opening" /> from each game to minimize
            the amount of space that it would take to store this data.
          </P>

          <CodeBlock
            code={`[
  {
    "elo": "The ELO of player (number)",
    "opening": "The Opening Name (string)"
  } // ...
]`}
            lang="json"
          />

          <P>
            I then determined the skew, mean, and median of each opening, as
            well as the dataset as a whole. The code and data for all of this
            information can be found on the Github.
          </P>

          <EloDistributionByOpening />
        </div>

        <div className="space-y-3">
          <H2 text="Analysis Results" />

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold tracking-wider text-blue-200">
                Opening Variety
              </h3>

              <P>
                The average and median ELO range of all of the datasets was
                typically around <strong>2000-2099</strong>, with the highest
                frequency (mode of the dataset) of games being played at the{" "}
                <strong>1900-1999</strong> range. This indicates an
                approximately symmetrical distribution, since the mean, median,
                and mode are around the same ELO range and the overall skew is{" "}
                <strong>-0.131</strong>.
              </P>

              <P>
                However, this data does not account for the number of games
                played in each ELO range. When looking at individual games, the
                maximum skew for positively distributed openings (
                <strong>0.9539</strong> for the{" "}
                <Highlight text="Canard Opening" />) is much lower than the
                maximum skew for negatively distributed openings (
                <strong>-1.3853</strong> for the{" "}
                <Highlight text="Two Knights Opening" />
                ), with the overall median skew of the dataset as{" "}
                <strong>-0.0657</strong>.
              </P>

              <P>
                Since the median and the skew for the negatively distributed
                openings are both negative, it indicates that while there were
                more negatively skewed openings, the number of the players per
                positively distributed openings at lower ELO's meant that the
                overall distribution of the dataset was approximately
                symmetrical.
              </P>

              <P>
                Openings with more standard moves like the{" "}
                <Highlight text="Italian Game" /> were played more at lower ELO
                ranges (averaging <strong>1900</strong> with a minimum of{" "}
                <strong>750</strong>) while harder, more theoretical openings
                like the <Highlight text="Nimzo-Indian Defense" /> were played
                far more at higher levels (averaging <strong>2200</strong> with
                a minimum of <strong>1150</strong>).
              </P>

              <P>
                What this indicates is that people are likely to play the same
                types of openings at lower ELOs before slowly transitioning out
                into more theoretical openings as they improve. Higher ELO
                players are also only likely to play openings that are either
                highly theoretical or consistent, hence why certain openings
                like the <Highlight text="Two Knights Opening" /> are an
                exception to this rule: simple yet played more effectively at a
                high level.
              </P>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold tracking-wider text-blue-200">
                Gambits and Irregular Openings
              </h3>

              <P>
                Interestingly, Gambits/Irregular openings tend to appear either
                at a very high level and less so at lower levels. This is known
                as a <Highlight text="U-Shaped Distribution" />, and is used to
                describe scenarios where the peaks of a dataset occur at the
                beginning and the end of the distribution while dipping in the
                middle.
              </P>

              <ImageDisplay
                src="/U-Shaped.svg"
                caption="A U-Shaped Distribution"
                width={500}
                height={300}
              />

              <P>
                Mathematically, these can be determined by a negative kurtosis
                value, which represents how arched the distribution is. A
                prominent example of this is the{" "}
                <Highlight text="Danish Gambit Declined" /> opening which has a
                kurtosis value of <strong>-1.23</strong>. While it features
                relatively simple opening moves, it leads into a weaker pawn
                structure due to the doubled pawns in the d file.
              </P>

              <ImageDisplay
                src="/danish-gambit-declined.png"
                caption={
                  <>
                    Danish Gambit Declined
                    <br />
                    (1. e4 e5 2. d4 exd4 3. c3 dxc3 4. Bc4 cxb2 5. Bxb2)
                  </>
                }
                width={250}
                height={250}
              />

              <div className="space-y-2">
                <P indent={false}>
                  This illustrates a trend with how different skill levels
                  approach these types of openings:
                </P>
                <P indent={false}>
                  • <strong>Lower level players</strong> likely play this
                  without recognizing the harm of doubled pawns. As a result
                  they have a higher density due to their lack of ability to
                  play other openings.
                </P>
                <P indent={false}>
                  • <strong>Mid level players</strong> are typically more aware
                  of doubled pawns, and will therefore avoid this opening as
                  much as possible.
                </P>
                <P indent={false}>
                  • <strong>High level players</strong> are aware of doubled
                  pawns, but are willing to break their principles if they
                  recognize some kind of benefit that results from this
                  particular opening.
                </P>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
});

Topic1.displayName = "Topic1";

export default Topic1;
