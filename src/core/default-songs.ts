import { Song, Setlist } from '../types';

export const DEFAULT_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Hallelujah',
    artist: 'Leonard Cohen',
    originalKey: 'C',
    transposeSemitones: 0,
    bpm: 58,
    scrollSpeed: 25,
    midiPatch: 1,
    notes: 'Line 6 POD: Preset 01-A (Acoustic Sim + Reverb Hall)',
    content: `[C]                 [Am]
I've heard there was a secret chord
     [C]                   [Am]
That David played, and it pleased the Lord
    [F]                [G]           [C]      [G]
But you don't really care for music, do you?
   [C]                [F]        [G]
It goes like this, the fourth, the fifth
    [Am]              [F]
The minor fall, the major lift
    [G]               [E7]          [Am]
The baffled king composing Hallelujah

[F]           [Am]
Hallelujah, Hallelujah
[F]           [C]   [G]   [C]
Hallelujah, Hallelu-u-u-u-jah

[C]                  [Am]
Your faith was strong but you needed proof
    [C]              [Am]
You saw her bathing on the roof
    [F]              [G]             [C]      [G]
Her beauty and the moonlight overthrew ya
    [C]             [F]      [G]
She tied you to a kitchen chair
    [Am]                         [F]
She broke your throne, and she cut your hair
    [G]                 [E7]          [Am]
And from your lips she drew the Hallelujah

[F]           [Am]
Hallelujah, Hallelujah
[F]           [C]   [G]   [C]
Hallelujah, Hallelu-u-u-u-jah
`,
  },
  {
    id: 'song-2',
    title: "Knockin' On Heaven's Door",
    artist: 'Bob Dylan',
    originalKey: 'G',
    transposeSemitones: 0,
    bpm: 70,
    scrollSpeed: 30,
    midiPatch: 2,
    notes: 'Line 6 POD: Preset 01-B (Crunch Overdrive + Delay 1/8d)',
    content: `[G]          [D]             [Am7]
Mama, take this badge off of me
[G]       [D]          [C]
I can't use it anymore
[G]           [D]                 [Am7]
It's gettin' dark, too dark to see
[G]         [D]                     [C]
I feel I'm knockin' on heaven's door

[G]            [D]                     [Am7]
Knock, knock, knockin' on heaven's door
[G]            [D]                     [C]
Knock, knock, knockin' on heaven's door
[G]            [D]                     [Am7]
Knock, knock, knockin' on heaven's door
[G]            [D]                     [C]
Knock, knock, knockin' on heaven's door

[G]          [D]             [Am7]
Mama, put my guns in the ground
[G]       [D]            [C]
I can't shoot them anymore
[G]                [D]            [Am7]
That long black cloud is comin' down
[G]         [D]                     [C]
I feel I'm knockin' on heaven's door

[G]            [D]                     [Am7]
Knock, knock, knockin' on heaven's door
[G]            [D]                     [C]
Knock, knock, knockin' on heaven's door
`,
  },
  {
    id: 'song-3',
    title: 'Comfortably Numb',
    artist: 'Pink Floyd',
    originalKey: 'Bm',
    transposeSemitones: 0,
    bpm: 64,
    scrollSpeed: 28,
    midiPatch: 3,
    notes: 'Line 6 POD: Preset 02-A (Big Muff Lead + Tape Echo + Chorus)',
    content: `[Bm]
Hello? Is there anybody in there?
            [A]
Just nod if you can hear me
[G]                [Em]   [Bm]
Is there anyone home?
[Bm]
Come on now, I hear you're feeling down
           [A]
Well I can ease your pain
    [G]               [Em]         [Bm]
Get you on your feet again

[Bm]
Relax, I'll need some information first
[A]
Just the basic facts
[G]                [Em]         [Bm]
Can you show me where it hurts?

[D]                         [A]
There is no pain, you are receding
[D]                          [A]
A distant ship's smoke on the horizon
[C]                               [G]
You are only coming through in waves
     [C]                                      [G]
Your lips move, but I can't hear what you're saying

     [D]                         [A]
When I was a child I had a fever
   [D]                           [A]
My hands felt just like two balloons
[C]                             [G]
Now I've got that feeling once again
             [C]                               [G]
I can't explain, you would not understand
                    [A]
This is not how I am

[G]  [D/F#]   [A]               [Bm]
I     have become comfortably numb
`,
  },
];

export const INITIAL_SETLIST: Setlist = {
  id: 'setlist-default',
  name: 'Garden Live Show 2026',
  updatedAt: new Date().toISOString(),
  songs: DEFAULT_SONGS,
};
