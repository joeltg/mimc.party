import React, { useMemo, useState } from "react"
import ReactDOM from "react-dom"

import { mimcWithRounds } from "./mimc.js"

const encodings = {
	hex: "Hex",
	dec: "Decimal",
	utf8: "UTF-8",
}

const patterns = {
	hex: /^([0-9a-fA-F]{2})+$/,
	dec: /^[0-9]+$/,
	utf8: /^.+$/,
}

type InputEncoding = "hex" | "dec" | "utf8"
type OutputEncoding = "hex" | "dec"

const inputEncodings: InputEncoding[] = ["hex", "dec", "utf8"]
const outputEncodings: OutputEncoding[] = ["hex", "dec"]

function Index({}) {
	const encoder = useMemo(() => new TextEncoder(), [])
	const [inputEncoding, setInputEncoding] = useState<InputEncoding>("hex")
	const [outputEncoding, setOutputEncoding] = useState<OutputEncoding>("hex")
	const placeholder = useMemo(
		() => patterns[inputEncoding].toString(),
		[inputEncoding]
	)

	const [rounds, setRounds] = useState(220)
	const hash = useMemo(() => mimcWithRounds(rounds), [rounds])

	const [input, setInput] = useState("")

	const value = useMemo<bigint | null>(() => {
		const valid = patterns[inputEncoding].test(input)
		if (valid === false) {
			return null
		} else if (inputEncoding === "hex") {
			return BigInt("0x" + input)
		} else if (inputEncoding === "dec") {
			return BigInt(input)
		} else if (inputEncoding === "utf8") {
			const data = encoder.encode(input)
			const hex = Array.from(data).map((n) => n.toString(16))
			return BigInt("0x" + hex.join(""))
		} else {
			return null
		}
	}, [inputEncoding, input])

	const output = useMemo<string | null>(() => {
		if (value === null) {
			return null
		}

		const output = hash(value)
		if (outputEncoding === "hex") {
			return output.toString(16)
		} else if (outputEncoding === "dec") {
			return output.toString(10)
		} else {
			return null
		}
	}, [value, hash, outputEncoding])

	return (
		<>
			<header>
				<h1>mimc.party</h1>
				<div>
					<img src="parrot.gif" />
					<img src="parrot.gif" />
					<img src="parrot.gif" />
					<img src="parrot.gif" />
					<img src="parrot.gif" />
				</div>
			</header>
			<hr />
			<form>
				<label>Input encoding:</label>
				{inputEncodings.map((key) => (
					<label key={key}>
						<input
							type="radio"
							value={key}
							name="type"
							checked={key === inputEncoding}
							onChange={(event) =>
								setInputEncoding(event.target.value as InputEncoding)
							}
						/>
						{encodings[key]}
					</label>
				))}
			</form>
			<textarea
				placeholder={placeholder}
				value={input}
				onChange={(event) => setInput(event.target.value)}
			></textarea>
			<form>
				<label>Number of rounds:</label>
				<input
					type="number"
					pattern="[0-9]*"
					step={1}
					min={0}
					value={rounds}
					onChange={(event) => setRounds(parseInt(event.target.value))}
				/>
			</form>
			<form>
				<label>Output encoding:</label>
				{outputEncodings.map((key) => (
					<label key={key}>
						<input
							type="radio"
							value={key}
							name="type"
							checked={key === outputEncoding}
							onChange={(event) =>
								setOutputEncoding(event.target.value as OutputEncoding)
							}
						/>
						{encodings[key]}
					</label>
				))}
			</form>
			<footer className={output === null ? "invalid" : undefined}>
				<code>{output}</code>
			</footer>
		</>
	)
}

const main = document.querySelector("main")

ReactDOM.render(<Index />, main)
