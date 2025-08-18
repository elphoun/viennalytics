import { memo } from "react";
import { ChessPieceIcon, P } from "@/app/_components";
import Hyperlink from "@/app/_components/text/Hyperlink";
import PromptOnHighlight from "@/app/_components/text/PromptOnHover";
import Section from "@/app/_components/text/Section";
import Highlight from "@/app/_components/text/Highlight";

/**
 * IntroductionSection component provides an introduction to the chess opening analysis.
 * Explains the importance of chess openings and the scope of the analysis.
 */
const Introduction = memo(() => (
    <Section title="Introduction" icon="👋">
        <P>
            There are very few games more popular than{' '}
            <Highlight text="Chess" icon={<ChessPieceIcon />} />.
            Over 18 million games are played on <Hyperlink link="https://www.chess.com/home">Chess.com</Hyperlink>{' '}
            everyday, and the game appeals to various skill demographics as both a casual pastime and a competitive challenge.
        </P>

        <P>
            At the core of each chess game is the <Highlight text="Opening" />.
            Openings serve as the “blueprint” of the game, allowing players to take early advantages by controlling the
            center and increasing their opportunities to trap and capture opposing pieces. As a professional{' '}
            <PromptOnHighlight prompt="Yes ik its not that good leave me alone">700</PromptOnHighlight>{' '}
            ELO player, I conducted an analysis on the{' '}
            <Hyperlink link="https://database.lichess.org/#broadcasts">lichess.org</Hyperlink>{' '}
            dataset to determine how different openings and opening moves impact later phases of the game.
            I will also discuss how data pertaining to specific players (i.e. ELO, moves) impact the performance of certain openings.
        </P>
    </Section>
));

Introduction.displayName = "Introduction";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default Introduction;