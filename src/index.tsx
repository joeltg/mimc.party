import React, { useMemo, useState } from "react"
import ReactDOM from "react-dom"

import { mimcWithRounds } from "./mimc.js"

const encodings = {
	hex: "Hex",
	dec: "Decimal",
	utf8: "UTF-8",
}

const patterns = {
	hex: /^[0-9a-fA-F]+$/,
	dec: /^[0-9]+$/,
	utf8: /^.+$/,
}

type InputEncoding = "hex" | "dec" | "utf8"
type OutputEncoding = "hex" | "dec"

const inputEncodings: InputEncoding[] = ["hex", "dec", "utf8"]
const outputEncodings: OutputEncoding[] = ["hex", "dec"]

const errorOutput = {
	hex: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
	dec: "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
}

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

	const values = useMemo<bigint[] | null>(() => {
		const inputs = input.split(/[\n ,]+/)
		const valid = inputs.every((input) => patterns[inputEncoding].test(input))
		if (valid === false) {
			return null
		} else if (inputEncoding === "hex") {
			return inputs.map((input) => BigInt("0x" + input))
		} else if (inputEncoding === "dec") {
			return inputs.map((input) => BigInt(input))
		} else if (inputEncoding === "utf8") {
			return inputs.map((input) => {
				const data = encoder.encode(input)
				let n = 0n
				for (let i = 0; i < data.length; i++) {
					n += BigInt(data[data.length - i - 1]) * 256n ** BigInt(i)
				}
				return n
			})
		} else {
			return null
		}
	}, [inputEncoding, input])

	const output = useMemo<string | null>(() => {
		if (values === null) {
			return null
		}

		const output = hash(...values)
		if (outputEncoding === "hex") {
			return output.toString(16)
		} else if (outputEncoding === "dec") {
			return output.toString(10)
		} else {
			return null
		}
	}, [values, hash, outputEncoding])

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
			<p>
				<em>
					separate multiple inputs with any combination of commas, spaces, or
					newlines
				</em>
			</p>
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
				<code>{output || errorOutput[outputEncoding]}</code>
			</footer>
		</>
	)
}

const main = document.querySelector("main")

ReactDOM.render(<Index />, main)
