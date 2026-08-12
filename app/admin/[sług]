import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  adminOverview,
  adminSetRole,
  adminSetChips,
  adminSetRoomStatus,
  adminUpdateRoomSettings,
  adminDeleteRoom,
  adminResetRoom,
  adminCreateBot,
  adminUpdateBot,
  adminDeleteBot,
  adminSeatBot,
  adminUnseat,
  adminGetBotAutoplaySettings,
  adminUpdateBotAutoplaySettings,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiveTablesBoard } from "@/components/poker/LiveTablesBoard";


const BOT_STYLES = [
  { value: "tight", label: "Ostrożny" },
  { value: "balanced", label: "Zrównoważony" },
  { value: "aggressive", label: "Agresywny" },
  { value: "wild", label: "Szalony" },
] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel administratora — Poker Table" },
      {
        name: "description",
        content: "Zarządzaj graczami, stołami, żetonami i wirtualnymi graczami.",
      },
      { property: "og:title", content: "Panel administratora — Poker Table" },
      {
        property: "og:description",
        content: "Zarządzaj graczami, stołami, żetonami i wirtualnymi graczami.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type SeatLike = {
  id: string;
  seat_position: number;
  user_id: string | null;
  chips_at_table: number;
};

type RoomLike = {
  id: string;
  name: string;
  status: string;
  small_blind: number;
  big_blind: number;
  max_players: number;
  poker_seats?: SeatLike[];
};

function AdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    retry: false,
  });

  const [busy, setBusy] = useState(false);
  const [botName, setBotName] = useState("");
  const [botStyle, setBotStyle] = useState("balanced");
  const [botChips, setBotChips] = useState("50000");

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      toast.success(label);
      await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Coś poszło nie tak");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Ładowanie panelu…</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-xl font-semibold">Brak dostępu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ten panel jest dostępny tylko dla administratorów.
        </p>
        <Link to="/lobby" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Wróć do lobby
          </Button>
        </Link>
      </div>
    );
  }

  const rooms = (data.rooms ?? []) as unknown as RoomLike[];

  const createBot = () => {
    const name = botName.trim();
    return run("Wirtualny gracz dodany", () =>
      adminCreateBot({
        data: {
          ...(name ? { display_name: name } : {}),
          bot_style: botStyle as "tight" | "balanced" | "aggressive" | "wild",
          chips_balance: Number(botChips) || 50000,
        },
      })
    ).then(() => setBotName(""));
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Panel administratora</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Zarządzaj graczami, stołami, żetonami i wirtualnymi graczami.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Gracze" value={data.stats.total_players} />
        <StatCard label="Boty" value={data.stats.total_bots} />
        <StatCard label="Stoły" value={data.stats.total_rooms} />
        <StatCard
          label="Żetony w obiegu"
          value={data.stats.chips_in_play.toLocaleString("pl-PL")}
        />
      </div>

      <Tabs defaultValue="live" className="mt-8">
        <TabsList>
          <TabsTrigger value="live">Podgląd live</TabsTrigger>
          <TabsTrigger value="players">Gracze</TabsTrigger>
          <TabsTrigger value="bots">Wirtualni gracze</TabsTrigger>
          <TabsTrigger value="rooms">Stoły</TabsTrigger>
          <TabsTrigger value="autoplay">Auto-play</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          <LiveTablesBoard />
        </TabsContent>



        <TabsContent value="players" className="mt-4 space-y-3">
          {data.players.map((p) => {
            const isAdmin = p.roles.includes("admin");
            return (
              <Card key={p.user_id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-40 flex-1">
                    <div className="flex items-center gap-2 font-medium">
                      {p.display_name ?? p.username ?? "Gracz"}
                      {p.is_bot && <Badge variant="secondary">bot</Badge>}
                      {isAdmin && <Badge>admin</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">@{p.username ?? "—"}</div>
                  </div>

                  <ChipsEditor
                    value={Number(p.chips_balance)}
                    disabled={busy}
                    onSave={(chips) =>
                      void run("Żetony zaktualizowane", () =>
                        adminSetChips({ data: { user_id: p.user_id, chips_balance: chips } })
                      )
                    }
                  />

                  <Button
                    size="sm"
                    variant={isAdmin ? "outline" : "secondary"}
                    disabled={busy}
                    onClick={() =>
                      void run("Rola zaktualizowana", () =>
                        adminSetRole({
                          data: { user_id: p.user_id, role: "admin", grant: !isAdmin },
                        })
                      )
                    }
                  >
                    {isAdmin ? "Odbierz admina" : "Nadaj admina"}
                  </Button>

                  {p.is_bot && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() =>
                        void run("Bot usunięty", () =>
                          adminDeleteBot({ data: { user_id: p.user_id } })
                        )
                      }
                    >
                      Usuń
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="bots" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dodaj wirtualnego gracza</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bot-name">Nazwa (opcjonalna)</Label>
                <Input
                  id="bot-name"
                  value={botName}
                  placeholder="np. Marek (bot)"
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Styl gry</Label>
                <Select value={botStyle} onValueChange={setBotStyle}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOT_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bot-chips">Żetony</Label>
                <Input
                  id="bot-chips"
                  type="number"
                  value={botChips}
                  onChange={(e) => setBotChips(e.target.value)}
                  className="w-32"
                />
              </div>
              <Button onClick={() => void createBot()} disabled={busy}>
                Dodaj bota
              </Button>
            </CardContent>
          </Card>

          {data.bots.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nie ma jeszcze żadnych wirtualnych graczy.
            </p>
          )}

          {data.bots.map((bot) => (
            <Card key={bot.user_id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-40 flex-1">
                  <div className="font-medium">{bot.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {Number(bot.chips_balance).toLocaleString("pl-PL")} żetonów
                  </div>
                </div>

                <Select
                  value={bot.bot_style ?? "balanced"}
                  onValueChange={(value) =>
                    void run("Bot zaktualizowany", () =>
                      adminUpdateBot({
                        data: {
                          user_id: bot.user_id,
                          bot_style: value as "tight" | "balanced" | "aggressive" | "wild",
                        },
                      })
                    )
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOT_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value=""
                  onValueChange={(value) => {
                    const [roomId, pos] = value.split("|");
                    if (!roomId || pos === undefined) return;
                    void run("Bot posadzony przy stole", () =>
                      adminSeatBot({
                        data: {
                          room_id: roomId,
                          bot_user_id: bot.user_id,
                          seat_position: Number(pos),
                        },
                      })
                    );
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Posadź przy stole…" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.flatMap((room) =>
                      (room.poker_seats ?? [])
                        .filter((s) => !s.user_id)
                        .sort((a, b) => a.seat_position - b.seat_position)
                        .map((s) => (
                          <SelectItem key={s.id} value={`${room.id}|${s.seat_position}`}>
                            {room.name} — miejsce {s.seat_position + 1}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() =>
                    void run("Bot usunięty", () =>
                      adminDeleteBot({ data: { user_id: bot.user_id } })
                    )
                  }
                >
                  Usuń
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rooms" className="mt-4 space-y-4">
          {rooms.length === 0 && <p className="text-sm text-muted-foreground">Brak stołów.</p>}
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{room.name}</CardTitle>
                  <div className="mt-1 text-xs text-muted-foreground">
                    blindy {room.small_blind}/{room.big_blind} · maks. {room.max_players} graczy
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={room.status}
                    onValueChange={(value) =>
                      void run("Status stołu zmieniony", () =>
                        adminSetRoomStatus({
                          data: {
                            room_id: room.id,
                            status: value as "waiting" | "playing" | "closed",
                          },
                        })
                      )
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiting">waiting</SelectItem>
                      <SelectItem value="playing">playing</SelectItem>
                      <SelectItem value="closed">closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void run("Stół zresetowany", () =>
                        adminResetRoom({ data: { room_id: room.id } })
                      )
                    }
                  >
                    Zresetuj rozdanie
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() =>
                      void run("Stół usunięty", () =>
                        adminDeleteRoom({ data: { room_id: room.id } })
                      )
                    }
                  >
                    Usuń stół
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RoomSettingsEditor
                  room={room}
                  disabled={busy}
                  onSave={(values) =>
                    void run("Parametry stołu zapisane", () =>
                      adminUpdateRoomSettings({ data: { room_id: room.id, ...values } })
                    )
                  }
                />
              </CardContent>
              <CardContent className="grid gap-2 sm:grid-cols-2">

                {(room.poker_seats ?? [])
                  .slice()
                  .sort((a, b) => a.seat_position - b.seat_position)
                  .map((seat) => {
                    const player = data.players.find((p) => p.user_id === seat.user_id);
                    return (
                      <div
                        key={seat.id}
                        className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span>
                          #{seat.seat_position + 1}{" "}
                          {player ? (
                            <span className="font-medium">
                              {player.display_name ?? player.username}
                              {player.is_bot ? " (bot)" : ""} — {seat.chips_at_table}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">wolne</span>
                          )}
                        </span>
                        {seat.user_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() =>
                              void run("Gracz wstał od stołu", () =>
                                adminUnseat({ data: { seat_id: seat.id } })
                              )
                            }
                          >
                            Zdejmij
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="autoplay" className="mt-4">
          <BotAutoplayPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function BotAutoplayPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["bot-autoplay-settings"],
    queryFn: () => adminGetBotAutoplaySettings(),
  });

  const [botsPerTable, setBotsPerTable] = useState("");
  const [botBuyin, setBotBuyin] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const settings = data;
  const botsPerTableValue = botsPerTable || String(settings?.bots_per_table ?? "");
  const botBuyinValue = botBuyin || String(settings?.bot_buyin ?? "");

  const handleToggle = async (enabled: boolean) => {
    try {
      await adminUpdateBotAutoplaySettings({ data: { autoplay_enabled: enabled } });
      toast.success(enabled ? "Auto-play włączony" : "Auto-play wyłączony");
      queryClient.invalidateQueries({ queryKey: ["bot-autoplay-settings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zmienić ustawienia");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminUpdateBotAutoplaySettings({
        data: {
          bots_per_table: Number(botsPerTableValue),
          bot_buyin: Number(botBuyinValue),
        },
      });
      toast.success("Zapisano ustawienia");
      queryClient.invalidateQueries({ queryKey: ["bot-autoplay-settings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nie udało się zapisać");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>;
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Boty w tle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Gdy włączone, stoły oznaczone przy tworzeniu jako „pozwól na boty” są automatycznie
            uzupełniane wirtualnymi graczami i rozgrywają kolejne rozdania nawet bez nikogo na
            stronie — obsługuje to zewnętrzny harmonogram wywołujący /api/bot-tick co minutę.
          </p>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Auto-play włączony</p>
              <p className="text-xs text-muted-foreground">
                Globalny wyłącznik — działa niezależnie od ustawienia pojedynczego stołu.
              </p>
            </div>
            <Switch checked={settings.autoplay_enabled} onCheckedChange={handleToggle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bots-per-table">Botów na stół (max)</Label>
              <Input
                id="bots-per-table"
                type="number"
                min={0}
                max={9}
                value={botsPerTableValue}
                onChange={(e) => setBotsPerTable(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bot-buyin-autoplay">Buy-in bota</Label>
              <Input
                id="bot-buyin-autoplay"
                type="number"
                min={1}
                value={botBuyinValue}
                onChange={(e) => setBotBuyin(e.target.value)}
              />
            </div>
          </div>

          <Button size="sm" onClick={() => void handleSave()} disabled={isSaving}>
            Zapisz ustawienia
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RoomSettingsEditor({
  room,
  disabled,
  onSave,
}: {
  room: RoomLike;
  disabled?: boolean;
  onSave: (values: {
    name: string;
    max_players: number;
    small_blind: number;
    big_blind: number;
  }) => void;
}) {
  const [name, setName] = useState(room.name);
  const [maxPlayers, setMaxPlayers] = useState(String(room.max_players));
  const [smallBlind, setSmallBlind] = useState(String(room.small_blind));
  const [bigBlind, setBigBlind] = useState(String(room.big_blind));

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Parametry stołu
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor={`name-${room.id}`}>Nazwa</Label>
          <Input
            id={`name-${room.id}`}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`sb-${room.id}`}>Mała ciemna</Label>
          <Input
            id={`sb-${room.id}`}
            type="number"
            min={1}
            value={smallBlind}
            onChange={(e) => setSmallBlind(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`bb-${room.id}`}>Duża ciemna</Label>
          <Input
            id={`bb-${room.id}`}
            type="number"
            min={2}
            value={bigBlind}
            onChange={(e) => setBigBlind(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`mp-${room.id}`}>Limit graczy</Label>
          <Select value={maxPlayers} onValueChange={setMaxPlayers}>
            <SelectTrigger id={`mp-${room.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} graczy
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          disabled={disabled}
          onClick={() =>
            onSave({
              name: name.trim() || room.name,
              max_players: Number(maxPlayers) || room.max_players,
              small_blind: Number(smallBlind) || room.small_blind,
              big_blind: Number(bigBlind) || room.big_blind,
            })
          }
        >
          Zapisz parametry
        </Button>
        <span className="text-xs text-muted-foreground">
          Wejściówka bota: 100 × duża ciemna
        </span>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ChipsEditor({
  value,
  disabled,
  onSave,
}: {
  value: number;
  disabled?: boolean;
  onSave: (chips: number) => void;
}) {
  const [chips, setChips] = useState(String(value));
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={chips}
        onChange={(e) => setChips(e.target.value)}
        className="w-32"
        aria-label="Żetony"
      />
      <Button size="sm" variant="outline" disabled={disabled} onClick={() => onSave(Number(chips) || 0)}>
        Zapisz
      </Button>
    </div>
  );
}
