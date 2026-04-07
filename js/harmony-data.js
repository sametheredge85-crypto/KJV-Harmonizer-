/**
 * Gospel Harmony Data
 * Maps parallel passages across the four Gospels
 */

const HARMONY_DATA = [
    {
        id: 1,
        title: "The Word Made Flesh",
        description: "John's prologue about the divine nature of Christ",
        matthew: null,
        mark: null,
        luke: null,
        john: { chapter: "1", verses: [1, 14] }
    },
    {
        id: 2,
        title: "The Birth of Jesus Announced",
        description: "The announcement of Jesus' birth",
        matthew: { chapter: "1", verses: [18, 25] },
        mark: null,
        luke: { chapter: "1", verses: [26, 31] },
        john: null
    },
    {
        id: 3,
        title: "The Birth of Jesus",
        description: "The nativity of Jesus Christ",
        matthew: { chapter: "1", verses: [18, 25] },
        mark: null,
        luke: { chapter: "2", verses: [1, 11] },
        john: null
    },
    {
        id: 4,
        title: "John the Baptist Prepares the Way",
        description: "John's ministry of baptism and preparation",
        matthew: { chapter: "3", verses: [1, 3] },
        mark: { chapter: "1", verses: [1, 4] },
        luke: { chapter: "3", verses: [1, 3] },
        john: { chapter: "1", verses: [6, 8] }
    },
    {
        id: 5,
        title: "The Baptism of Jesus",
        description: "Jesus is baptized by John in the Jordan",
        matthew: { chapter: "3", verses: [13, 17] },
        mark: { chapter: "1", verses: [9, 11] },
        luke: { chapter: "3", verses: [21, 22] },
        john: { chapter: "1", verses: [29, 34] }
    },
    {
        id: 6,
        title: "The Temptation of Jesus",
        description: "Jesus is tempted in the wilderness",
        matthew: { chapter: "4", verses: [1, 4] },
        mark: { chapter: "1", verses: [12, 13] },
        luke: { chapter: "4", verses: [1, 2] },
        john: null
    },
    {
        id: 7,
        title: "Jesus Begins His Ministry",
        description: "Jesus begins preaching in Galilee",
        matthew: { chapter: "4", verses: [17, 17] },
        mark: { chapter: "1", verses: [14, 15] },
        luke: null,
        john: null
    },
    {
        id: 8,
        title: "The Calling of the First Disciples",
        description: "Jesus calls Peter, Andrew, James, and John",
        matthew: { chapter: "4", verses: [18, 20] },
        mark: { chapter: "1", verses: [16, 18] },
        luke: null,
        john: { chapter: "1", verses: [35, 42] }
    },
    {
        id: 9,
        title: "The Beatitudes",
        description: "Jesus teaches blessings from the Sermon on the Mount",
        matthew: { chapter: "5", verses: [1, 12] },
        mark: null,
        luke: null,
        john: null
    },
    {
        id: 10,
        title: "The Lord's Prayer",
        description: "Jesus teaches his disciples how to pray",
        matthew: { chapter: "6", verses: [9, 13] },
        mark: null,
        luke: null,
        john: null
    },
    {
        id: 11,
        title: "Nicodemus Visits Jesus",
        description: "Jesus teaches about being born again",
        matthew: null,
        mark: null,
        luke: null,
        john: { chapter: "3", verses: [1, 17] }
    },
    {
        id: 12,
        title: "Jesus Comforts His Disciples",
        description: "Jesus promises to prepare a place",
        matthew: null,
        mark: null,
        luke: null,
        john: { chapter: "14", verses: [1, 6] }
    },
    {
        id: 13,
        title: "The Resurrection",
        description: "The women discover the empty tomb",
        matthew: { chapter: "28", verses: [1, 6] },
        mark: { chapter: "16", verses: [1, 6] },
        luke: { chapter: "24", verses: [1, 6] },
        john: { chapter: "20", verses: [1, 1] }
    },
    {
        id: 14,
        title: "The Great Commission",
        description: "Jesus commissions his disciples",
        matthew: { chapter: "28", verses: [18, 20] },
        mark: { chapter: "16", verses: [15, 16] },
        luke: { chapter: "24", verses: [46, 47] },
        john: { chapter: "20", verses: [19, 21] }
    }
];

/**
 * Get all harmony events
 * @returns {Array} Array of harmony event objects
 */
function getHarmonyEvents() {
    return HARMONY_DATA;
}

/**
 * Get a specific harmony event by ID
 * @param {number} id - Event ID
 * @returns {Object|null} Harmony event or null if not found
 */
function getHarmonyEvent(id) {
    return HARMONY_DATA.find(event => event.id === id) || null;
}

/**
 * Get passages for a harmony event formatted for display
 * @param {Object} event - Harmony event object
 * @returns {Object} Object with passages for each Gospel
 */
function getHarmonyPassages(event) {
    const passages = {
        matthew: null,
        mark: null,
        luke: null,
        john: null
    };
    
    const gospels = ['matthew', 'mark', 'luke', 'john'];
    const bookNames = {
        matthew: 'Matthew',
        mark: 'Mark',
        luke: 'Luke',
        john: 'John'
    };
    
    gospels.forEach(gospel => {
        if (event[gospel]) {
            const ref = event[gospel];
            const book = bookNames[gospel];
            const verses = getVerses(book, ref.chapter, ref.verses[0], ref.verses[1]);
            
            if (verses.length > 0) {
                passages[gospel] = {
                    reference: `${book} ${ref.chapter}:${ref.verses[0]}${ref.verses[1] !== ref.verses[0] ? '-' + ref.verses[1] : ''}`,
                    verses: verses
                };
            }
        }
    });
    
    return passages;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HARMONY_DATA, getHarmonyEvents, getHarmonyEvent, getHarmonyPassages };
}
