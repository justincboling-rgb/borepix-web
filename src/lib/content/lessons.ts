import type { Lesson } from "@/lib/content/types";

/**
 * MRI Mastery lessons. Plain-text teaching content; formulas use unicode.
 * Every checkQuestionIds entry must exist in src/lib/content/questions/mri.ts.
 */
export const lessons: Lesson[] = [
  {
    slug: "larmor-and-resonance",
    title: "Precession, Larmor and resonance",
    summary:
      "Why hydrogen precesses in a magnetic field, how to calculate its frequency at 1.5 T and 3.0 T, and how an RF pulse at that frequency creates the MR signal.",
    level: "Foundations",
    minutes: 12,
    sections: [
      {
        heading: "Why MRI images hydrogen",
        body: [
          "Clinical MRI images hydrogen. A hydrogen nucleus is a single proton, it is abundant in the water and fat that make up most of the body, and it has a relatively large magnetic moment. Because the proton spins and carries a positive charge, it behaves like a tiny bar magnet.",
          "Outside a magnet, these magnetic moments point in random directions and cancel out. Inside the static field B₀ they line up either parallel to the field (the low-energy state) or antiparallel to it (the high-energy state). Slightly more line up parallel, and that small excess is what MRI measures.",
        ],
      },
      {
        heading: "Net magnetization",
        body: [
          "The vector sum of all the aligned moments in a voxel is the net magnetization vector (NMV), often written M₀. At equilibrium it points along B₀, called the longitudinal or z axis. The excess of parallel protons is only a few per million at clinical field strengths, but a voxel holds so many protons that the NMV is still measurable.",
          "The size of that excess grows roughly in proportion to field strength. That is the main reason a 3.0 T system has more available signal than a 1.5 T system, all else being equal. Field strength does not change how many protons a tissue contains; proton density is a property of the tissue.",
          "Higher field has costs. T1 times lengthen, chemical shift and susceptibility effects increase, and RF heating rises. Later lessons return to each of these trade-offs.",
        ],
      },
      {
        heading: "The Larmor equation",
        body: [
          "Each proton's magnetic moment wobbles, or precesses, around the direction of B₀, much like a spinning top wobbles around the pull of gravity. The rate is set by the Larmor equation: ω₀ = γ · B₀. Here ω₀ is the precessional (Larmor) frequency, γ is the gyromagnetic ratio of the nucleus and B₀ is the static field strength in tesla.",
          "For hydrogen, γ/2π is 42.58 MHz/T. Multiply it by field strength to get the frequency: 0.5 T gives about 21.3 MHz, 1.0 T about 42.6 MHz, 1.5 T about 63.9 MHz and 3.0 T about 127.7 MHz. The relationship is linear, so doubling the field doubles the frequency.",
          "These frequencies fall in the radio band. That is why the scanner transmits and receives radiofrequency (RF) energy, and why the magnet room is an RF-shielded enclosure. Outside RF that leaks in, for example through a door that is not fully closed, shows up as a zipper artifact.",
        ],
      },
      {
        heading: "Resonance and the RF pulse",
        body: [
          "Resonance is the efficient transfer of energy to a system that oscillates at the same frequency as the energy source. In MRI, an RF pulse transmitted at the Larmor frequency of hydrogen is absorbed by the protons; RF at a different frequency is not. Change the field strength and the transmit frequency must change with it.",
          "Absorbing RF energy does two things. Some protons move into the high-energy antiparallel state, and the precessing protons are brought into phase with one another. Together these tip the NMV away from B₀ by an amount called the flip angle, which depends on the amplitude and duration of the RF pulse.",
          "A 90° pulse moves all of the longitudinal magnetization into the transverse (xy) plane, with the protons precessing in phase. A 180° pulse inverts longitudinal magnetization so it points antiparallel to B₀, which is how inversion recovery begins; applied to transverse magnetization, a 180° pulse refocuses it into a spin echo. Gradient-echo sequences often use flip angles smaller than 90°.",
        ],
      },
      {
        heading: "From magnetization to signal",
        body: [
          "Transverse magnetization rotating at the Larmor frequency induces a small voltage in a nearby receiver coil, as described by Faraday's law of induction. When the RF pulse is switched off, that signal, the free induction decay (FID), starts strong and fades as the protons dephase and relax.",
          "The Larmor equation is also the basis of spatial localization. Gradient coils make field strength vary slightly with position, so protons at different locations precess at slightly different frequencies. An RF pulse containing a narrow band of frequencies then excites only the protons in one slice.",
          "Exam tip: when a question asks what changes between 1.5 T and 3.0 T, start with the Larmor equation. The frequency doubles, the NMV and available signal increase, and RF energy deposition (SAR) rises about fourfold for the same sequence.",
        ],
      },
    ],
    keyPoints: [
      "Hydrogen is imaged because it is abundant in water and fat and has a relatively large magnetic moment.",
      "The NMV comes from a small excess of protons in the low-energy parallel state, and it grows with B₀.",
      "Larmor equation: ω₀ = γ · B₀, with γ/2π = 42.58 MHz/T for hydrogen.",
      "Hydrogen precesses at about 63.9 MHz at 1.5 T and about 127.7 MHz at 3.0 T.",
      "RF at the Larmor frequency causes resonance; a 90° pulse tips the NMV fully into the transverse plane with the protons in phase.",
    ],
    lab: "larmor",
    checkQuestionIds: ["mri-ip-001", "mri-ip-002", "mri-ip-003"],
  },
  {
    slug: "t1-t2-relaxation",
    title: "T1 recovery and T2 decay",
    summary:
      "What happens to magnetization after the RF pulse ends, why tissues relax at different rates and how T1, T2 and T2* are defined.",
    level: "Foundations",
    minutes: 14,
    sections: [
      {
        heading: "Two processes at once",
        body: [
          "When the RF pulse ends, the NMV returns toward equilibrium through two processes that happen at the same time but independently. T1 recovery is the regrowth of longitudinal magnetization along B₀. T2 decay is the loss of transverse magnetization as the protons fall out of phase.",
          "Both are exponential and are described by time constants measured in milliseconds. In tissue, T2 is always shorter than T1. White matter at 1.5 T, for example, has a T1 near 880 ms and a T2 near 70 ms, so its transverse signal is gone long before its longitudinal magnetization has fully recovered.",
        ],
      },
      {
        heading: "T1 recovery (spin-lattice relaxation)",
        body: [
          "T1 recovery happens as protons give the energy they absorbed back to their surroundings, the molecular lattice, so it is also called spin-lattice relaxation. The recovery curve is Mz(t) = M₀ · (1 − e^(−t/T1)).",
          "T1 is the time it takes for longitudinal magnetization to reach 63% of its maximum value after a 90° pulse. After two T1 periods about 86% has recovered, after three about 95%, and after five more than 99%.",
          "Fat has a short T1 because its molecules exchange energy with the lattice efficiently. Free water, such as CSF, has a long T1. Representative values at 1.5 T are about 260 ms for fat, 880 ms for white matter and 4000 ms for CSF, and T1 lengthens as field strength increases.",
        ],
      },
      {
        heading: "T2 decay (spin-spin relaxation)",
        body: [
          "Immediately after a 90° pulse, the protons precess in phase. Each proton's own small magnetic field slightly changes the field felt by its neighbors, so their precessional frequencies differ a little and they gradually fall out of phase. This is spin-spin relaxation, and transverse magnetization fades as Mxy(t) = Mxy(0) · e^(−t/T2).",
          "T2 is the time it takes for transverse magnetization to fall to 37% of its initial value. After two T2 periods about 14% remains, and after three about 5%.",
          "Free water has a long T2, because its small, fast-moving molecules average out local field differences; the representative CSF value used in the lab is 2000 ms. Tissues with tightly bound protons, such as tendon, ligament and meniscus, have very short T2 and appear dark on most sequences.",
        ],
      },
      {
        heading: "T2* and field inhomogeneity",
        body: [
          "The FID actually decays faster than T2 alone predicts. Small imperfections in the main field and local magnetic susceptibility differences, such as at air-tissue boundaries or around metal, make protons precess at slightly different frequencies. The combined decay from true T2 and these fixed inhomogeneities is called T2*, and T2* is always shorter than T2.",
          "A spin-echo sequence applies a 180° refocusing pulse at TE/2. Protons that were precessing faster because of a fixed field difference are flipped behind the slower ones and catch up, so the inhomogeneity dephasing is reversed at the echo. True T2 dephasing is random and cannot be reversed.",
          "A gradient-echo sequence forms its echo by reversing a gradient instead of applying a 180° RF pulse. The reversal undoes only the dephasing that the gradient itself caused, so gradient-echo signal decays with T2*. That is why gradient-echo images show larger signal voids around metal and blooming of blood products, and why susceptibility-weighted imaging relies on gradient echoes.",
        ],
      },
      {
        heading: "How relaxation creates contrast",
        body: [
          "At any moment after excitation, tissues with different T1 and T2 values hold different amounts of magnetization. Image contrast comes from choosing when to sample: TR sets how far T1 recovery has progressed before the next excitation, and TE sets how far T2 decay has progressed when the echo is read.",
          "The lab below plots recovery and decay curves for fat, white matter, gray matter, muscle and CSF at 1.5 T and 3.0 T. The values are representative, since published measurements vary by method. Look for the times where two curves are farthest apart: that is where contrast between those tissues is greatest.",
        ],
      },
    ],
    keyPoints: [
      "T1 recovery and T2 decay happen at the same time, and independently, after the RF pulse.",
      "T1 is the time to recover 63% of longitudinal magnetization; about five T1 periods give full recovery.",
      "T2 is the time for transverse magnetization to fall to 37%, and T2 is always shorter than T1 in tissue.",
      "Fat has a short T1; free water such as CSF has a long T1 and a long T2.",
      "T2* includes field inhomogeneity: spin echo refocuses it, gradient echo does not.",
    ],
    lab: "relaxation",
    checkQuestionIds: ["mri-ip-004", "mri-ip-005", "mri-ip-006"],
  },
  {
    slug: "tr-te-and-image-contrast",
    title: "TR, TE and image contrast",
    summary:
      "How TR, TE and TI turn relaxation differences into T1-weighted, T2-weighted, PD-weighted, STIR and FLAIR images.",
    level: "Core",
    minutes: 16,
    sections: [
      {
        heading: "TR controls T1 weighting",
        body: [
          "Repetition time (TR) is the time from one excitation pulse to the next, in milliseconds. It decides how much longitudinal magnetization each tissue has recovered before it is excited again, so TR controls T1 weighting.",
          "With a short TR, roughly 300 to 800 ms at 1.5 T, short-T1 tissues such as fat have recovered most of their magnetization and give strong signal, while long-T1 tissues such as CSF have recovered little and appear dark. With a long TR, typically 2000 ms or more, most tissues recover almost fully, so T1 differences shrink.",
          "A short TR also shortens the scan, because conventional spin-echo scan time equals TR × phase-encoding steps × NEX. Because T1 lengthens at 3.0 T, TR values for T1-weighted imaging are often adjusted upward there.",
        ],
      },
      {
        heading: "TE controls T2 weighting",
        body: [
          "Echo time (TE) is the time from the excitation pulse to the center of the echo. It decides how much transverse magnetization each tissue has lost when the signal is measured, so TE controls T2 weighting.",
          "With a short TE, roughly 30 ms or less, little decay has happened in any tissue and T2 differences are small. With a long TE, roughly 80 ms or more, short-T2 tissues have lost most of their signal while long-T2 tissues such as fluid and edema stay bright. A longer TE always lowers overall signal, so SNR falls as T2 weighting increases.",
        ],
      },
      {
        heading: "Putting TR and TE together",
        body: [
          "T1-weighted: short TR and short TE, for example TR 500 ms and TE 15 ms. Fat is bright, fluid is dark and anatomy is crisp. Post-gadolinium imaging is T1-weighted, because gadolinium shortens T1 and makes enhancing tissue bright.",
          "T2-weighted: long TR and long TE, for example TR 4000 ms and TE 100 ms. Fluid and most pathology with edema are bright. Proton density-weighted: long TR and short TE, for example TR 3000 ms and TE 20 ms. The long TR removes most T1 differences and the short TE removes most T2 differences, so contrast reflects how many mobile protons each tissue contains.",
          "A short TR combined with a long TE gives little signal and mixed contrast, so it is not used for routine imaging. When a question gives you TR and TE, classify each one separately as short or long, then combine them.",
        ],
      },
      {
        heading: "Spin echo, fast spin echo and gradient echo",
        body: [
          "Conventional spin echo uses a 90° excitation and a 180° refocusing pulse and acquires one phase-encoding line per TR. Fast (turbo) spin echo applies a train of 180° pulses after each excitation, and each echo fills a different line of k-space. The number of echoes is the echo train length (ETL), and scan time falls roughly in proportion: with the same TR, matrix and NEX, an ETL of 16 is about 16 times faster than conventional spin echo.",
          "In fast spin echo, contrast is set by the effective TE, the TE of the echoes placed in the center of k-space. Fat stays relatively bright on T2-weighted fast spin-echo images compared with conventional spin echo, which is one reason fat suppression is often added. Long echo trains also raise SAR, because every echo needs another 180° pulse.",
          "Gradient-echo sequences use a flip angle below 90° and form the echo by reversing a gradient, which allows a very short TR. With a short TR, a larger flip angle increases T1 weighting and a smaller flip angle reduces it, while a longer TE increases T2* weighting. Gradient echoes are fast and sensitive to blood products and metal.",
        ],
      },
      {
        heading: "Inversion recovery: STIR and FLAIR",
        body: [
          "Inversion recovery starts with a 180° pulse that flips longitudinal magnetization to point against B₀. During the inversion time (TI), each tissue recovers from negative toward positive and crosses zero at a moment set by its T1. If the 90° excitation is applied exactly at that zero crossing, the tissue has no magnetization to tip and gives no signal. When TR is long enough for full recovery, the null point is TI = ln 2 × T1 ≈ 0.69 × T1.",
          "STIR (short tau inversion recovery) uses a short TI to null fat. With a fat T1 near 260 ms at 1.5 T, the formula gives about 0.69 × 260 ≈ 180 ms; because fat T1 lengthens at 3.0 T, STIR TI is set longer there. STIR suppresses fat uniformly even when the field is not perfectly homogeneous, but it nulls any tissue with a T1 similar to fat, so it is not used after gadolinium, which shortens T1 in enhancing tissue.",
          "FLAIR (fluid-attenuated inversion recovery) uses a long TI, roughly 2000 ms or more depending on TR and field strength, to null CSF while keeping T2 weighting. Bright lesions next to the ventricles, such as demyelinating plaques, then stand out against dark CSF. That is why FLAIR is a core sequence in brain protocols for suspected multiple sclerosis.",
        ],
      },
      {
        heading: "Choosing a fat suppression method",
        body: [
          "Fat and water protons precess at slightly different frequencies, about 3.5 ppm apart: roughly 220 Hz at 1.5 T and roughly 450 Hz at 3.0 T. Spectral (chemical) fat saturation applies an RF pulse tuned to the fat frequency and spoils that signal before each excitation. It is tissue-specific and works with gadolinium, but it needs a homogeneous field and can fail near metal, at air-tissue interfaces and at the edges of a large FOV.",
          "Choose STIR when the field is less uniform, such as near metal or over a large FOV, and when gadolinium is not involved. Choose spectral fat saturation for post-contrast T1-weighted imaging. Dixon techniques acquire in-phase and opposed-phase echoes and calculate separate water and fat images, which gives robust fat suppression and allows fat quantification.",
        ],
      },
    ],
    keyPoints: [
      "TR controls T1 weighting; TE controls T2 weighting.",
      "T1W: short TR, short TE. T2W: long TR, long TE. PDW: long TR, short TE.",
      "Fast spin echo shortens scan time by about the echo train length, and the effective TE sets contrast.",
      "Inversion recovery nulls a tissue at TI ≈ 0.69 × T1: a short TI nulls fat (STIR), a long TI nulls CSF (FLAIR).",
      "STIR is not used after gadolinium; spectral fat saturation is, but it needs a homogeneous field.",
    ],
    lab: "relaxation",
    checkQuestionIds: ["mri-ip-007", "mri-ip-010", "mri-pr-001"],
  },
  {
    slug: "k-space-and-spatial-encoding",
    title: "k-space and spatial encoding",
    summary:
      "How gradients encode position, how k-space is filled and why its center controls contrast while its edges control detail.",
    level: "Core",
    minutes: 16,
    sections: [
      {
        heading: "Three gradients, three jobs",
        body: [
          "Gradient coils add a small, controlled slope to the main field along x, y or z, so field strength, and therefore Larmor frequency, varies with position. MRI uses this to localize signal in three steps.",
          "The slice-select gradient is on during the RF pulse, so only protons whose frequency falls within the pulse's bandwidth are excited. Slice thickness depends on the RF bandwidth and the gradient slope: a steeper gradient or a narrower bandwidth gives a thinner slice.",
          "Within the slice, the phase-encoding gradient is switched on briefly before the echo and gives each row a different phase. The frequency-encoding (readout) gradient is on while the echo is sampled, so each column precesses at a different frequency. The scanner separates frequencies with a Fourier transform and builds up phase information over many repetitions.",
        ],
      },
      {
        heading: "What k-space is",
        body: [
          "k-space is the raw data matrix where the digitized echoes are stored before the image is reconstructed. In a conventional 2D acquisition, each echo fills one line, and the strength of the phase-encoding gradient used for that echo decides which line it fills.",
          "k-space is not a picture of the patient. Every point in k-space contributes to every pixel of the image, and the image is produced by a two-dimensional Fourier transform of the whole matrix. Each slice, or each 3D volume, has its own k-space.",
        ],
      },
      {
        heading: "Center versus periphery",
        body: [
          "Lines near the center of k-space are acquired with weak phase-encoding gradients, so the protons stay largely in phase and the echoes are strong. These low spatial frequencies carry most of the signal and set overall image contrast and SNR.",
          "Lines near the edges are acquired with steep phase-encoding gradients, which dephase the signal more and give weaker echoes. These high spatial frequencies define edges and fine detail, so they set spatial resolution. An image built from the center alone looks bright but blurry; one built from the edges alone shows only outlines.",
          "This explains two exam favorites. In fast spin echo, the effective TE is the TE of the echoes placed in the center of k-space. In contrast-enhanced MRA, the scan is timed so that the center of k-space is filled at peak arterial enhancement, using a test bolus or bolus tracking, often with centric ordering.",
        ],
      },
      {
        heading: "Resolution, SNR and scan time",
        body: [
          "Pixel size equals FOV divided by matrix. A 240 mm FOV with a 256 matrix gives pixels of about 0.94 mm; doubling the matrix to 512 at the same FOV halves the pixel size to about 0.47 mm. Voxel volume is pixel width × pixel height × slice thickness, and SNR is proportional to voxel volume, so finer resolution always costs signal.",
          "For conventional 2D spin echo, scan time = TR × phase-encoding steps × NEX. At TR 500 ms, 256 phase-encoding steps and 2 NEX, that is 500 ms × 256 × 2 = 256 s, or 4 min 16 s. Increasing the phase matrix lengthens the scan; increasing the frequency matrix does not.",
          "Signal averages (NEX) add signal coherently and noise randomly, so SNR rises with the square root of NEX: doubling NEX doubles scan time but improves SNR by only about 1.4 times (√2). A narrower receiver bandwidth also raises SNR, at the cost of more chemical shift artifact and a longer minimum TE. Thicker slices and a larger FOV raise SNR but lower resolution.",
        ],
      },
      {
        heading: "Artifacts tied to encoding",
        body: [
          "Aliasing (wraparound) happens when anatomy extends beyond the FOV in the phase-encoding direction. Its phase values repeat those inside the FOV, so it is folded onto the opposite side of the image. Fixes are a larger phase FOV, phase oversampling (often labeled no phase wrap) or swapping the phase and frequency directions so the long axis of the anatomy lies along frequency. The frequency direction is protected by oversampling and filtering on modern scanners.",
          "Motion ghosting also appears in the phase-encoding direction. Each phase-encoding line comes from a different TR, so anything that moves between repetitions, such as breathing, pulsating vessels or swallowing, has inconsistent phase and is copied into ghosts. Respiratory triggering or navigators, breath-hold sequences, cardiac gating, saturation bands over the moving tissue and swapping the phase direction all reduce it.",
          "Other artifacts have their own signatures. Chemical shift misregistration is a bright and dark band at fat-water interfaces along the frequency direction; a wider receiver bandwidth reduces it, and it doubles at 3.0 T for the same bandwidth per pixel. Truncation (Gibbs) ringing appears as fine parallel lines next to sharp, high-contrast edges and is reduced by increasing the matrix. A zipper artifact is a line of noise from outside RF entering the room, often through a door that is not fully closed.",
        ],
      },
    ],
    keyPoints: [
      "Slice-select, phase-encoding and frequency-encoding gradients localize signal by making Larmor frequency vary with position.",
      "The center of k-space sets contrast and SNR; the periphery sets spatial resolution.",
      "Pixel size = FOV ÷ matrix, and SNR is proportional to voxel volume and to √NEX.",
      "2D spin-echo scan time = TR × phase-encoding steps × NEX.",
      "Aliasing and motion ghosts appear in the phase-encoding direction; chemical shift appears in the frequency direction.",
    ],
    lab: "kspace",
    checkQuestionIds: ["mri-ip-008", "mri-ip-009", "mri-pr-005"],
  },
  {
    slug: "rf-safety-and-sar",
    title: "RF safety and SAR",
    summary:
      "How RF energy heats tissue, what the IEC SAR limits are and how positioning and protocol choices prevent burns.",
    level: "Core",
    minutes: 14,
    sections: [
      {
        heading: "Where RF heating comes from",
        body: [
          "The RF pulses that excite protons also induce electric fields and small currents in the patient's conductive tissue. Resistance to those currents turns RF energy into heat, which makes heating the main thermal risk of MRI.",
          "Specific absorption rate (SAR) is the RF power absorbed per unit mass of tissue, measured in watts per kilogram (W/kg). The scanner estimates SAR from the sequence and the patient's weight before and during every scan, so entering an accurate weight is a safety step, not paperwork.",
          "Patients with impaired thermoregulation, such as those who are febrile, sedated, very young, elderly or living with cardiovascular disease, are less able to shed heat. Airflow through the bore, light clothing and avoiding unnecessary layers help the body dissipate it.",
        ],
      },
      {
        heading: "SAR limits under IEC 60601-2-33",
        body: [
          "The international safety standard for MR equipment, IEC 60601-2-33, defines operating modes with SAR limits. In normal operating mode, whole-body SAR is limited to 2 W/kg. In first level controlled operating mode the whole-body limit is 4 W/kg, and the patient requires medical supervision because outputs may cause physiological stress. The head SAR limit is 3.2 W/kg.",
          "SAR values are averaged over a 6-minute period, and short bursts are capped as well. A second level controlled mode above these values exists only for research under ethics committee approval and is not used clinically.",
          "The scanner asks the operator to confirm before entering first level controlled mode. Many MR Conditional implants are labeled for normal operating mode or for lower RF exposure, such as a reduced whole-body SAR or a specified B1+rms value, so an implant's conditions can be stricter than the scanner's default limits.",
        ],
      },
      {
        heading: "What drives SAR up",
        body: [
          "SAR scales with the square of the static field strength, the square of the flip angle and the number of RF pulses delivered per unit time. Moving a protocol from 1.5 T to 3.0 T with the same flip angles and timing increases SAR about fourfold, because 2² = 4.",
          "A 180° pulse deposits about four times the energy of a 90° pulse of the same duration. Fast spin-echo sequences with long echo trains, short echo spacing and many slices are therefore among the highest-SAR sequences, and a short TR with many slices increases the number of pulses per unit time.",
          "To lower SAR, reduce the refocusing flip angle (for example to 120° to 150° instead of 180°), lengthen TR or reduce the number of slices per TR, shorten the echo train, increase echo spacing or use a low-SAR RF mode. A local transmit/receive coil, such as a head or knee coil, exposes less of the body to RF than the body coil.",
        ],
      },
      {
        heading: "Preventing RF burns",
        body: [
          "Most MR burns are thermal injuries from RF-induced currents, not effects of the static field. Current concentrates where conductive paths are small: skin-to-skin contact points such as touching thighs, crossed ankles or clasped hands, skin touching the bore, and loops of cable, ECG leads or coil wires.",
          "Prevention is mostly positioning. Use insulating pads to separate the thighs, the arms from the torso where they touch, and the skin from the bore wall. Ask patients not to cross their arms or legs or clasp their hands. Run cables straight down the table without loops, keep them away from the bore wall and pad between cables and skin.",
          "Change patients into a gown without metal, since street clothing can contain metallic fibers, and remove transdermal patches with metallic backing after the ordering provider approves. Give every patient the call device, tell them to report any warmth or burning immediately, and stop the scan if they do.",
        ],
      },
      {
        heading: "Exam-ready decision rules",
        body: [
          "If a question asks what happens to SAR when field strength doubles, the answer is about four times higher. If it asks how to reduce SAR without changing field strength, look for a lower flip angle, a longer TR, fewer slices, a shorter echo train or a local transmit coil.",
          "If a question describes crossed ankles, clasped hands or cables touching the skin, the answer is to pad and reposition before scanning. Remember the IEC numbers: 2 W/kg whole-body in normal operating mode, 4 W/kg in first level controlled mode and 3.2 W/kg for the head.",
        ],
      },
    ],
    keyPoints: [
      "RF pulses induce currents that heat tissue; SAR measures absorbed RF power in W/kg.",
      "IEC 60601-2-33 whole-body SAR: 2 W/kg in normal mode, 4 W/kg in first level controlled mode; head 3.2 W/kg.",
      "SAR scales with B₀² and with flip angle², so 3.0 T gives about four times the SAR of 1.5 T for the same sequence.",
      "Burns concentrate at skin-to-skin contact points, skin-to-bore contact and cable loops.",
      "Prevent burns with insulating pads, straight padded cables, no crossed limbs and an accurate patient weight.",
    ],
    lab: "sar",
    checkQuestionIds: ["mri-sa-006", "mri-sa-007", "mri-sa-008"],
  },
  {
    slug: "mr-safety-zones-and-screening",
    title: "MR safety zones and screening",
    summary:
      "How the ACR four-zone model controls access to the magnet, what MR Safe, MR Conditional and MR Unsafe mean and how to screen people and objects.",
    level: "Foundations",
    minutes: 15,
    sections: [
      {
        heading: "The static field is always on",
        body: [
          "A superconducting MR magnet stays at field all the time, including nights, weekends and power outages. The field cannot be seen, heard or felt, and it extends beyond the magnet as a fringe field that falls off steeply with distance. Many serious MR accidents happen because someone forgets this.",
          "Ferromagnetic objects experience two forces. Translational force pulls the object toward the magnet and depends on the spatial field gradient, how quickly field strength changes with distance, so it is greatest near the bore opening and the magnet housing. Torque twists the object to align with the field and is greatest at isocenter, where the field is strongest.",
          "The 5 gauss (0.5 mT) line is the traditional limit for people with pacemakers and other active implants, and areas inside it must be access-controlled. Oxygen cylinders, IV poles, tools and cleaning equipment that cross into Zone IV can become projectiles.",
        ],
      },
      {
        heading: "The ACR four-zone model",
        body: [
          "The ACR Manual on MR Safety divides the MR suite into four zones. Zone I includes all areas freely accessible to the public, outside the MR environment. Zone II is the interface between public areas and the controlled zones, where patients are greeted, screened and supervised by MR personnel; it is not required to be locked.",
          "Zone III is the area where unscreened people or ferromagnetic objects could cause serious injury or death through interaction with the scanner. It must be physically restricted, for example with key or badge locks, and access is controlled by MR personnel. Zone IV is the magnet room itself; it always lies within Zone III, must be clearly marked as hazardous, and MR personnel at the console should have a direct view of its entrance.",
          "MR personnel are Level 1 (trained to work safely in Zones III and IV) or Level 2 (with additional training in issues such as RF heating and gradient-induced nerve stimulation). Patients, visitors and other staff are non-MR personnel and must be screened and accompanied or directly supervised by MR personnel in Zones III and IV. The MR medical director is responsible for the site's safety policies.",
        ],
      },
      {
        heading: "MR Safe, MR Conditional and MR Unsafe",
        body: [
          "ASTM F2503 defines three labels. MR Safe items pose no known hazards in any MR environment because they are nonconducting, nonmetallic and nonmagnetic; the icon is a green square marked MR. MR Conditional items have been shown to pose no known hazards only in a specified MR environment under specified conditions; the icon is a yellow triangle. MR Unsafe items pose unacceptable risks in all MR environments; the icon is a red circle with a diagonal bar.",
          "Conditions on an MR Conditional label commonly include static field strength (for example 1.5 T only, or 1.5 T and 3.0 T), maximum spatial field gradient (in T/m or gauss/cm), RF limits such as whole-body SAR, head SAR or B1+rms, the operating mode, maximum scan time and sometimes the allowed coil or landmark position. Every condition must be met. A device labeled for 1.5 T only cannot be scanned at 3.0 T, even at low SAR, because force, torque and heating behavior differ.",
          "Older terms such as MR compatible are no longer used for labeling. An item with unknown status is treated as unsafe until it is identified, and any decision to scan outside labeled conditions is a documented risk-benefit judgment by the MR medical director.",
        ],
      },
      {
        heading: "Screening every person and object",
        body: [
          "Every patient and every non-MR person entering Zone III is screened with a written questionnaire followed by a verbal interview with MR personnel. The questionnaire covers implants and devices, prior surgery, metal fragments and injuries from metal, medication patches, pregnancy, kidney disease when contrast is planned and prior MR exams.",
          "Patients with a history of possible metal in the eye, such as a metalworker struck by a fragment, need orbital screening before entering Zone IV: orbital radiographs, or a review of CT or radiographs of the orbits obtained since the injury. A retained ferromagnetic fragment can move and cause blindness, and a lack of current symptoms does not clear the patient.",
          "For any implant, identify the exact make and model from the implant card, operative report or manufacturer, find the current labeling and confirm that the scanner, coil and protocol meet every condition. Patients change into gowns, remove all belongings and are checked again at the Zone IV door. A ferromagnetic detection system can support screening but never replaces it.",
          "Patients who cannot complete screening, such as unconscious or confused patients, are screened using family members, medical records and, when needed, radiographs. If the history still cannot be established, the radiologist decides whether imaging is justified.",
        ],
      },
      {
        heading: "Emergencies in the MR environment",
        body: [
          "If a patient has a cardiac arrest or another medical emergency in Zone IV, MR personnel begin basic life support while removing the patient immediately from Zone IV to a pre-designated area where the code team can work. Defibrillators, oxygen cylinders and other code equipment are often ferromagnetic, and the field stays on during an emergency, so responders do not enter Zone IV.",
          "A quench boils off the liquid helium so the magnet loses its field. It is reserved for life-threatening situations caused by the static field itself, such as a person pinned against the magnet by a ferromagnetic object. Helium should vent outside through the quench pipe; if it enters the room it can displace oxygen and cause asphyxiation and cold injury, and pressure in the room can make the door hard to open, so everyone leaves.",
          "Firefighters, police and security staff responding to Zone III are stopped and briefed, because their tools, air tanks and weapons are ferromagnetic. Only MR Conditional fire extinguishers belong in Zone IV.",
        ],
      },
    ],
    keyPoints: [
      "The static field of a superconducting magnet is always on, so Zone IV is hazardous even when no scan is running.",
      "Zone I is public, Zone II is the screening interface, Zone III is physically restricted and Zone IV is the magnet room inside Zone III.",
      "MR Safe: no known hazards in any MR environment. MR Conditional: safe only when every listed condition is met. MR Unsafe: never enters Zone IV.",
      "Screen every person with a written form and a verbal interview; suspected orbital metal requires orbital imaging first.",
      "In a Zone IV emergency, start CPR and move the patient out; the code team stays out of Zone IV.",
    ],
    checkQuestionIds: ["mri-sa-001", "mri-sa-002", "mri-pc-001"],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
