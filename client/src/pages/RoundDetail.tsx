import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card, CardBody, CardHeader,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Chip, Button, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { api } from "../api";
import { fmtSG, fmtDate } from "../lib/format";
import type { RoundDetail as RoundDetailT } from "../../../shared/types/index.js";

function SGChip({ value, bold }: { value: number; bold?: boolean }) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color={value >= 0 ? "success" : "danger"}
      classNames={{ content: `font-mono tabular-nums text-xs ${bold ? "font-semibold" : "font-medium"}` }}
    >
      {fmtSG(value)}
    </Chip>
  );
}

export function RoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [round, setRound] = useState<RoundDetailT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!id) return;
    api.getRound(Number(id)).then(setRound).catch((e) => setError(String(e)));
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await api.deleteRound(Number(id));
      navigate("/rounds");
    } catch (e) {
      setError(String(e));
      setDeleting(false);
    }
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!round) return <p className="text-[#4A6B57]">Loading…</p>;

  const scoreDiff = round.totalStrokes - round.totalPar;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <Button as={Link} to="/rounds" variant="light" color="primary" size="sm" className="px-0">
          ← Rounds
        </Button>
        <Button variant="light" color="danger" size="sm" onPress={onOpen}>
          Delete Round
        </Button>
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="text-[#003D2B]">Delete Round</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#4A6B57]">
              Are you sure you want to delete{" "}
              <strong className="text-[#1A2E23]">{round?.course}</strong> on{" "}
              {round && fmtDate(round.date)}? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={deleting}>Cancel</Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Summary card */}
      <Card className="border border-[#C8DDD0]" shadow="none">
        <CardHeader className="bg-[#003D2B] px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-start w-full">
            <div>
              <h2 className="text-[#F5D130] font-bold text-xl m-0">{round.course}</h2>
              <p className="text-white/60 text-sm m-0">{fmtDate(round.date)}</p>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-2xl font-mono tabular-nums">
                {round.totalStrokes}{" "}
                <span className={scoreDiff <= 0 ? "text-green-400" : "text-red-400"}>
                  ({scoreDiff >= 0 ? "+" : ""}{scoreDiff})
                </span>
              </div>
              <div className="text-white/60 text-xs">vs par {round.totalPar}</div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-5">
          <div className="grid grid-cols-4 gap-4 text-center">
            {(["TEE", "APPROACH", "SHORT_GAME", "PUTTING"] as const).map((cat) => (
              <div key={cat} className="flex flex-col gap-1">
                <span className="text-[#4A6B57] text-xs uppercase tracking-wide">
                  {cat.replace("_", " ")}
                </span>
                <SGChip value={round.sgByCategory[cat]} bold />
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <div className="flex justify-center">
            <div className="text-center">
              <span className="text-[#4A6B57] text-xs uppercase tracking-wide block mb-1">SG Total</span>
              <SGChip value={round.sgTotal} bold />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Per-hole cards */}
      <h3 className="text-[#003D2B] font-bold text-lg m-0">Holes</h3>
      {round.holes.map((h) => (
        <Card key={h.number} className="border border-[#C8DDD0] border-l-4 border-l-[#00563F]" shadow="none">
          <CardHeader className="px-5 py-3 flex justify-between items-center">
            <span className="font-semibold text-[#003D2B]">Hole {h.number} · Par {h.par}</span>
            <span className="text-sm text-[#4A6B57]">{h.strokes} strokes</span>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <Table
              aria-label={`Hole ${h.number} shots`}
              classNames={{
                th: "bg-[#003D2B] text-[#F5D130] font-semibold text-xs uppercase tracking-wide",
                td: "text-xs py-2",
              }}
              shadow="none"
              removeWrapper
            >
              <TableHeader>
                <TableColumn>#</TableColumn>
                <TableColumn>From</TableColumn>
                <TableColumn>Dist</TableColumn>
                <TableColumn>To</TableColumn>
                <TableColumn>Dist</TableColumn>
                <TableColumn>Category</TableColumn>
                <TableColumn>SG</TableColumn>
              </TableHeader>
              <TableBody>
                {h.shots.map((s) => (
                  <TableRow key={s.shotNumber}>
                    <TableCell>{s.shotNumber}</TableCell>
                    <TableCell>{s.startLie}</TableCell>
                    <TableCell><span className="font-mono tabular-nums">{s.startDistance}{s.startLie === "GREEN" ? "ft" : "y"}</span></TableCell>
                    <TableCell>{s.endLie}</TableCell>
                    <TableCell>
                      <span className="font-mono tabular-nums">
                        {s.endLie === "HOLE" ? "—" : `${s.endDistance}${s.endLie === "GREEN" ? "ft" : "y"}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="dot" color="primary" classNames={{ content: "text-xs" }}>
                        {s.category.replace("_", " ")}
                      </Chip>
                    </TableCell>
                    <TableCell><SGChip value={s.strokesGained} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
