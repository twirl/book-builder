import { Context } from '../models/Context';
import { Source } from '../models/Source';
import { getContentModificationTime } from '../util/modificationTime';
import { Counters } from './helpers/Counters';
import { getSectionParametersFromSource } from './helpers/getSectionParametersFromSource';
import { getSectionWithChaptersFromParameters } from './helpers/getSectionWithChaptersFromParameters';
import { Section } from './Section';

export class Structure {
    private sections: Section[] = [];
    constructor(private readonly counters: Counters) {}

    public appendSection(section: Section) {
        section.setCounter(this.counters.getSectionCountIncremented());
        this.sections.push(section);
    }

    public prependSection(section: Section, position: number) {
        this.sections.splice(position, 0, section);
    }

    public getSections() {
        return this.sections;
    }

    public getContentModificationTimeMs(): number | null {
        return getContentModificationTime(this.getSections(), (section) =>
            section.getContentModificationTimeMs()
        );
    }
}

export const getStructure = async (
    source: Source,
    context: Context
): Promise<Structure> => {
    const counters = new Counters();
    const structure = new Structure(counters);

    const sectionParameters = await getSectionParametersFromSource(
        source,
        context
    );

    for (const parameters of sectionParameters) {
        structure.appendSection(
            await getSectionWithChaptersFromParameters(
                parameters,
                counters,
                context
            )
        );
    }

    return structure;
};
