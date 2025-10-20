use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
use tower_http::cors::CorsLayer;
use sqlx::{PgPool, Row};
use serde::{Deserialize, Serialize};
use std::env;
use tokio;
use chrono::{NaiveDate, NaiveDateTime, NaiveTime};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, decode, Header, Validation, EncodingKey, DecodingKey};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    rol: String,
    usuario_id: i32,
}

#[derive(Serialize, Deserialize)]
struct LoginRequest {
    email: String,
    contrasena: String,
}

#[derive(Serialize, Deserialize)]
struct LoginResponse {
    token: String,
    rol: String,
    usuario_id: i32,
    nombre: String,
    apellido: String,
}

#[derive(Serialize, Deserialize)]
struct Paciente {
    id: Option<i32>,
    nombre: String,
    apellido: String,
    ci: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
}

#[derive(Serialize, Deserialize)]
struct PacienteConEdad {
    id: i32,
    nombre: String,
    apellido: String,
    ci: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    edad: i32,
}

#[derive(Serialize, Deserialize)]
struct Expediente {
    id: i32,
    paciente_id: i32,
    fecha_creacion: NaiveDateTime, // Cambiado a NaiveDateTime
}

#[derive(Serialize, Deserialize)]
struct ExpedienteDiagnostico {
    id: i32,
    expediente_id: i32,
    diagnostico: String,
    tratamiento: Option<String>,
    fecha_registro: NaiveDateTime, // Cambiado a NaiveDateTime
}

#[derive(Serialize, Deserialize)]
struct NuevoExpedienteDiagnostico {
    diagnostico: String,
    tratamiento: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct Rol {
    id: i32,
    nombre: String,
}

#[derive(Serialize, Deserialize)]
struct Usuario {
    id: Option<i32>,
    nombre: String,
    apellido: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    rol_id: i32,
    contrasena_hash: String,
}

#[derive(Serialize, Deserialize)]
struct UsuarioConRol {
    id: i32,
    nombre: String,
    apellido: String,
    telefono: String,
    email: String,
    fecha_nacimiento: NaiveDate,
    sexo: String,
    rol_id: i32,
    rol_nombre: String,
}

#[derive(Serialize, Deserialize)]
struct Horario {
    id: Option<i32>,
    usuario_id: i32,
    dia_semana: String,
    hora_inicio: NaiveTime,
    hora_fin: NaiveTime,
}

#[derive(Serialize, Deserialize)]
struct HorarioConUsuario {
    id: i32,
    usuario_id: i32,
    nombre_usuario: String,
    apellido_usuario: String,
    dia_semana: String,
    hora_inicio: NaiveTime,
    hora_fin: NaiveTime,
}

#[derive(Serialize, Deserialize)]
struct Cita {
    id: Option<i32>,
    paciente_id: i32,
    usuario_id: i32,
    fecha_hora: NaiveDateTime,
    estado: String,
    motivo: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct CitaConDetalles {
    id: i32,
    paciente_id: i32,
    nombre_paciente: String,
    apellido_paciente: String,
    usuario_id: i32,
    nombre_medico: String,
    apellido_medico: String,
    fecha_hora: NaiveDateTime,
    estado: String,
    motivo: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct RecuperarContrasenaRequest {
    email: String,
}

#[derive(Serialize, Deserialize)]
struct CambiarContrasenaRequest {
    token: String,
    nueva_contrasena: String,
}

#[derive(Serialize, Deserialize)]
struct RecuperarContrasenaResponse {
    mensaje: String,
}

#[derive(Serialize, Deserialize)]
struct CambiarContrasenaResponse {
    mensaje: String,
}

#[derive(Serialize, Deserialize)]
struct PerfilExamen {
    id: i32,
    nombre: String,
}

#[derive(Serialize, Deserialize)]
struct Examen {
    id: i32,
    nombre: String,
    descripcion: Option<String>,
    referencia_resultado: Option<String>,
    perfil_id: i32,
}

#[derive(Serialize, Deserialize)]
struct ExamenConPerfil {
    id: i32,
    nombre: String,
    descripcion: Option<String>,
    referencia_resultado: Option<String>,
    perfil_nombre: String,
}

#[derive(Serialize, Deserialize)]
struct ExamenDiagnostico {
    id: i32,
    expediente_diagnostico_id: i32,
    examen_id: i32,
    resultado: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct ExamenDiagnosticoConDetalles {
    id: i32,
    expediente_diagnostico_id: i32,
    examen_id: i32,
    examen_nombre: String,
    examen_descripcion: Option<String>,
    examen_referencia: Option<String>,
    resultado: Option<String>,
}

#[derive(Serialize, Deserialize)]
struct NuevoExamenDiagnostico {
    examen_id: i32,
    resultado: Option<String>,
}

// --- FUNCIONES DE RUTAS ---

// GET /pacientes
async fn get_pacientes(State(pool): State<PgPool>) -> Result<Json<Vec<PacienteConEdad>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT id, nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo, EXTRACT(YEAR FROM AGE(fecha_nacimiento))::INTEGER AS edad FROM pacientes"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let pacientes: Vec<PacienteConEdad> = rows
        .into_iter()
        .map(|row| PacienteConEdad {
            id: row.get("id"),
            nombre: row.get("nombre"),
            apellido: row.get("apellido"),
            ci: row.get("ci"),
            telefono: row.get("telefono"),
            email: row.get("email"),
            fecha_nacimiento: row.get("fecha_nacimiento"),
            sexo: row.get("sexo"),
            edad: row.get("edad"),
        })
        .collect();

    Ok(Json(pacientes))
}

// POST /pacientes
async fn create_paciente(
    State(pool): State<PgPool>,
    Json(paciente): Json<Paciente>,
) -> Result<Json<Paciente>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO pacientes (nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id"
    )
    .bind(&paciente.nombre)
    .bind(&paciente.apellido)
    .bind(&paciente.ci)
    .bind(&paciente.telefono)
    .bind(&paciente.email)
    .bind(paciente.fecha_nacimiento)
    .bind(&paciente.sexo)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear paciente: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Paciente {
        id: Some(id),
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ci: paciente.ci,
        telefono: paciente.telefono,
        email: paciente.email,
        fecha_nacimiento: paciente.fecha_nacimiento,
        sexo: paciente.sexo,
    }))
}

// GET /pacientes/:id
async fn get_paciente_by_id(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<PacienteConEdad>, StatusCode> {
    let row = sqlx::query(
        "SELECT id, nombre, apellido, ci, telefono, email, fecha_nacimiento, sexo, EXTRACT(YEAR FROM AGE(fecha_nacimiento))::INTEGER AS edad FROM pacientes WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener paciente: {}", e);
        if e.as_database_error().map_or(false, |db_err| {
            db_err.code().map_or(false, |code| code == "23505")
        }) {
            StatusCode::CONFLICT
        } else {
            StatusCode::NOT_FOUND
        }
    })?;

    let paciente = PacienteConEdad {
        id: row.get("id"),
        nombre: row.get("nombre"),
        apellido: row.get("apellido"),
        ci: row.get("ci"),
        telefono: row.get("telefono"),
        email: row.get("email"),
        fecha_nacimiento: row.get("fecha_nacimiento"),
        sexo: row.get("sexo"),
        edad: row.get("edad"),
    };

    Ok(Json(paciente))
}

// PUT /pacientes/:id
async fn update_paciente(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Json(paciente): Json<Paciente>,
) -> Result<Json<Paciente>, StatusCode> {
    sqlx::query(
        "UPDATE pacientes SET nombre = $1, apellido = $2, ci = $3, telefono = $4, email = $5, fecha_nacimiento = $6, sexo = $7 WHERE id = $8"
    )
    .bind(&paciente.nombre)
    .bind(&paciente.apellido)
    .bind(&paciente.ci)
    .bind(&paciente.telefono)
    .bind(&paciente.email)
    .bind(paciente.fecha_nacimiento)
    .bind(&paciente.sexo)
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al actualizar paciente: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Paciente {
        id: Some(id),
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        ci: paciente.ci,
        telefono: paciente.telefono,
        email: paciente.email,
        fecha_nacimiento: paciente.fecha_nacimiento,
        sexo: paciente.sexo,
    }))
}

// DELETE /pacientes/:id
async fn delete_paciente(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM pacientes WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al eliminar paciente: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(StatusCode::NO_CONTENT)
}

// GET /expedientes/{paciente_id}
async fn get_expediente_by_paciente(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Expediente>, StatusCode> {
    let row = sqlx::query(
        "SELECT id, paciente_id, fecha_creacion FROM expedientes WHERE paciente_id = $1"
    )
    .bind(paciente_id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener expediente: {}", e);
        StatusCode::NOT_FOUND
    })?;

    let expediente = Expediente {
        id: row.get("id"),
        paciente_id: row.get("paciente_id"),
        fecha_creacion: row.get("fecha_creacion"),
    };

    Ok(Json(expediente))
}

// GET /expedientes/{paciente_id}/diagnosticos
async fn get_diagnosticos_by_expediente(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<ExpedienteDiagnostico>>, StatusCode> {
    let row = sqlx::query("SELECT id FROM expedientes WHERE paciente_id = $1")
        .bind(paciente_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Expediente no encontrado para paciente {}: {}", paciente_id, e);
            StatusCode::NOT_FOUND
        })?;

    let expediente_id: i32 = row.get("id");

    let rows = sqlx::query(
        "SELECT id, expediente_id, diagnostico, tratamiento, fecha_registro FROM expedientes_diagnosticos WHERE expediente_id = $1"
    )
    .bind(expediente_id)
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener diagnósticos: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let diagnosticos: Vec<ExpedienteDiagnostico> = rows
        .into_iter()
        .map(|row| ExpedienteDiagnostico {
            id: row.get("id"),
            expediente_id: row.get("expediente_id"),
            diagnostico: row.get("diagnostico"),
            tratamiento: row.get("tratamiento"),
            fecha_registro: row.get("fecha_registro"),
        })
        .collect();

    Ok(Json(diagnosticos))
}

// POST /expedientes/{paciente_id}/diagnosticos
async fn create_diagnostico(
    Path(paciente_id): Path<i32>,
    State(pool): State<PgPool>,
    Json(diagnostico_data): Json<NuevoExpedienteDiagnostico>,
) -> Result<Json<ExpedienteDiagnostico>, StatusCode> {
    let row = sqlx::query("SELECT id FROM expedientes WHERE paciente_id = $1")
        .bind(paciente_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Expediente no encontrado para paciente {}: {}", paciente_id, e);
            StatusCode::NOT_FOUND
        })?;

    let expediente_id: i32 = row.get("id");

    let result = sqlx::query(
        "INSERT INTO expedientes_diagnosticos (expediente_id, diagnostico, tratamiento) VALUES ($1, $2, $3) RETURNING id, fecha_registro"
    )
    .bind(expediente_id)
    .bind(&diagnostico_data.diagnostico)
    .bind(&diagnostico_data.tratamiento)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear diagnóstico: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");
    let fecha_registro = result.get("fecha_registro");

    let nuevo_diagnostico = ExpedienteDiagnostico {
        id,
        expediente_id,
        diagnostico: diagnostico_data.diagnostico,
        tratamiento: diagnostico_data.tratamiento,
        fecha_registro,
    };

    Ok(Json(nuevo_diagnostico))
}

// GET /usuarios
async fn get_usuarios(State(pool): State<PgPool>) -> Result<Json<Vec<UsuarioConRol>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT u.id, u.nombre, u.apellido, u.telefono, u.email, u.fecha_nacimiento, u.sexo, u.rol_id, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta de usuarios: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let usuarios: Vec<UsuarioConRol> = rows
        .into_iter()
        .map(|row| UsuarioConRol {
            id: row.get("id"),
            nombre: row.get("nombre"),
            apellido: row.get("apellido"),
            telefono: row.get("telefono"),
            email: row.get("email"),
            fecha_nacimiento: row.get("fecha_nacimiento"),
            sexo: row.get("sexo"),
            rol_id: row.get("rol_id"),
            rol_nombre: row.get("rol_nombre"),
        })
        .collect();

    Ok(Json(usuarios))
}

// POST /usuarios
async fn create_usuario(
    State(pool): State<PgPool>,
    Json(usuario): Json<Usuario>,
) -> Result<Json<Usuario>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO usuarios (nombre, apellido, telefono, email, fecha_nacimiento, sexo, rol_id, contrasena_hash) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id"
    )
    .bind(&usuario.nombre)
    .bind(&usuario.apellido)
    .bind(&usuario.telefono)
    .bind(&usuario.email)
    .bind(usuario.fecha_nacimiento)
    .bind(&usuario.sexo)
    .bind(usuario.rol_id)
    .bind(&usuario.contrasena_hash)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear usuario: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Usuario {
        id: Some(id),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        email: usuario.email,
        fecha_nacimiento: usuario.fecha_nacimiento,
        sexo: usuario.sexo,
        rol_id: usuario.rol_id,
        contrasena_hash: usuario.contrasena_hash,
    }))
}

// GET /horarios
async fn get_horarios(State(pool): State<PgPool>) -> Result<Json<Vec<HorarioConUsuario>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT h.id, h.usuario_id, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, h.dia_semana, h.hora_inicio, h.hora_fin FROM horarios h JOIN usuarios u ON h.usuario_id = u.id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta de horarios: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let horarios: Vec<HorarioConUsuario> = rows
        .into_iter()
        .map(|row| HorarioConUsuario {
            id: row.get("id"),
            usuario_id: row.get("usuario_id"),
            nombre_usuario: row.get("nombre_usuario"),
            apellido_usuario: row.get("apellido_usuario"),
            dia_semana: row.get("dia_semana"),
            hora_inicio: row.get("hora_inicio"),
            hora_fin: row.get("hora_fin"),
        })
        .collect();

    Ok(Json(horarios))
}

// POST /horarios
async fn create_horario(
    State(pool): State<PgPool>,
    Json(horario): Json<Horario>,
) -> Result<Json<Horario>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO horarios (usuario_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4) RETURNING id"
    )
    .bind(horario.usuario_id)
    .bind(&horario.dia_semana)
    .bind(&horario.hora_inicio)
    .bind(&horario.hora_fin)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear horario: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Horario {
        id: Some(id),
        usuario_id: horario.usuario_id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
    }))
}

// GET /horarios/{id}
async fn get_horario_by_id(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<HorarioConUsuario>, StatusCode> {
    let row = sqlx::query(
        "SELECT h.id, h.usuario_id, u.nombre AS nombre_usuario, u.apellido AS apellido_usuario, h.dia_semana, h.hora_inicio, h.hora_fin FROM horarios h JOIN usuarios u ON h.usuario_id = u.id WHERE h.id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener horario: {}", e);
        StatusCode::NOT_FOUND
    })?;

    let horario = HorarioConUsuario {
        id: row.get("id"),
        usuario_id: row.get("usuario_id"),
        nombre_usuario: row.get("nombre_usuario"),
        apellido_usuario: row.get("apellido_usuario"),
        dia_semana: row.get("dia_semana"),
        hora_inicio: row.get("hora_inicio"),
        hora_fin: row.get("hora_fin"),
    };

    Ok(Json(horario))
}

// PUT /horarios/{id}
async fn update_horario(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Json(horario): Json<Horario>,
) -> Result<Json<Horario>, StatusCode> {
    sqlx::query(
        "UPDATE horarios SET usuario_id = $1, dia_semana = $2, hora_inicio = $3, hora_fin = $4 WHERE id = $5"
    )
    .bind(horario.usuario_id)
    .bind(&horario.dia_semana)
    .bind(&horario.hora_inicio)
    .bind(&horario.hora_fin)
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al actualizar horario: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Horario {
        id: Some(id),
        usuario_id: horario.usuario_id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
    }))
}

// DELETE /horarios/{id}
async fn delete_horario(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM horarios WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al eliminar horario: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(StatusCode::NO_CONTENT)
}

// GET /citas
async fn get_citas(State(pool): State<PgPool>) -> Result<Json<Vec<CitaConDetalles>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT c.id, c.paciente_id, p.nombre AS nombre_paciente, p.apellido AS apellido_paciente, c.usuario_id, u.nombre AS nombre_medico, u.apellido AS apellido_medico, c.fecha_hora, c.estado, c.motivo FROM citas c JOIN pacientes p ON c.paciente_id = p.id JOIN usuarios u ON c.usuario_id = u.id"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error en la consulta de citas: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let citas: Vec<CitaConDetalles> = rows
        .into_iter()
        .map(|row| CitaConDetalles {
            id: row.get("id"),
            paciente_id: row.get("paciente_id"),
            nombre_paciente: row.get("nombre_paciente"),
            apellido_paciente: row.get("apellido_paciente"),
            usuario_id: row.get("usuario_id"),
            nombre_medico: row.get("nombre_medico"),
            apellido_medico: row.get("apellido_medico"),
            fecha_hora: row.get("fecha_hora"),
            estado: row.get("estado"),
            motivo: row.get("motivo"),
        })
        .collect();

    Ok(Json(citas))
}

// POST /citas
async fn create_cita(
    State(pool): State<PgPool>,
    Json(cita): Json<Cita>,
) -> Result<Json<Cita>, StatusCode> {
    let result = sqlx::query(
        "INSERT INTO citas (paciente_id, usuario_id, fecha_hora, estado, motivo) VALUES ($1, $2, $3, $4, $5) RETURNING id"
    )
    .bind(cita.paciente_id)
    .bind(cita.usuario_id)
    .bind(cita.fecha_hora)
    .bind(&cita.estado)
    .bind(&cita.motivo)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al crear cita: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let id = result.get("id");

    Ok(Json(Cita {
        id: Some(id),
        paciente_id: cita.paciente_id,
        usuario_id: cita.usuario_id,
        fecha_hora: cita.fecha_hora,
        estado: cita.estado,
        motivo: cita.motivo,
    }))
}

// GET /citas/{id}
async fn get_cita_by_id(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<CitaConDetalles>, StatusCode> {
    let row = sqlx::query(
        "SELECT c.id, c.paciente_id, p.nombre AS nombre_paciente, p.apellido AS apellido_paciente, c.usuario_id, u.nombre AS nombre_medico, u.apellido AS apellido_medico, c.fecha_hora, c.estado, c.motivo FROM citas c JOIN pacientes p ON c.paciente_id = p.id JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = $1"
    )
    .bind(id)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al obtener cita: {}", e);
        StatusCode::NOT_FOUND
    })?;

    let cita = CitaConDetalles {
        id: row.get("id"),
        paciente_id: row.get("paciente_id"),
        nombre_paciente: row.get("nombre_paciente"),
        apellido_paciente: row.get("apellido_paciente"),
        usuario_id: row.get("usuario_id"),
        nombre_medico: row.get("nombre_medico"),
        apellido_medico: row.get("apellido_medico"),
        fecha_hora: row.get("fecha_hora"),
        estado: row.get("estado"),
        motivo: row.get("motivo"),
    };

    Ok(Json(cita))
}

// PUT /citas/{id}
async fn update_cita(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
    Json(cita): Json<Cita>,
) -> Result<Json<Cita>, StatusCode> {
    sqlx::query(
        "UPDATE citas SET paciente_id = $1, usuario_id = $2, fecha_hora = $3, estado = $4, motivo = $5 WHERE id = $6"
    )
    .bind(cita.paciente_id)
    .bind(cita.usuario_id)
    .bind(cita.fecha_hora)
    .bind(&cita.estado)
    .bind(&cita.motivo)
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|e| {
        eprintln!("Error al actualizar cita: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(Cita {
        id: Some(id),
        paciente_id: cita.paciente_id,
        usuario_id: cita.usuario_id,
        fecha_hora: cita.fecha_hora,
        estado: cita.estado,
        motivo: cita.motivo,
    }))
}

// DELETE /citas/{id}
async fn delete_cita(
    Path(id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<StatusCode, StatusCode> {
    sqlx::query("DELETE FROM citas WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al eliminar cita: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(StatusCode::NO_CONTENT)
}


//Login
async fn login(
    State(pool): State<PgPool>,
    Json(login_data): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, StatusCode> {
    // Buscar usuario por email
    let row = sqlx::query(
    "SELECT u.id, u.contrasena_hash, u.rol_id, u.nombre, u.apellido, r.nombre AS rol_nombre FROM usuarios u JOIN roles r ON u.rol_id = r.id WHERE u.email = $1"
)
    .bind(&login_data.email)
    .fetch_one(&pool)
    .await
    .map_err(|e| {
        eprintln!("Usuario no encontrado: {}", e);
        StatusCode::UNAUTHORIZED
    })?;

    let contrasena_hash: String = row.get("contrasena_hash");
    let rol_id: i32 = row.get("rol_id");
    let usuario_id: i32 = row.get("id");
    let nombre: String = row.get("nombre");    // ✅ Obtenido
    let apellido: String = row.get("apellido"); // ✅ Obtenido
    let rol_nombre: String = row.get("rol_nombre");

    // Verificar contraseña
    let password_valid = verify(&login_data.contrasena, &contrasena_hash)
        .map_err(|e| {
            eprintln!("Error al verificar contraseña: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !password_valid {
        eprintln!("Contraseña incorrecta para usuario: {}", login_data.email);
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Obtener nombre del rol
    let rol_row = sqlx::query("SELECT nombre FROM roles WHERE id = $1")
        .bind(rol_id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al obtener rol: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let rol_nombre: String = rol_row.get("nombre");

    // Crear token JWT
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() + 3600; // 1 hora de expiración

    let claims = Claims {
        sub: login_data.email,
        exp: expiration as usize,
        rol: rol_nombre.clone(),
        usuario_id,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("tu_clave_secreta_aqui".as_ref()),
    ).map_err(|e| {
        eprintln!("Error al crear token: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(LoginResponse {
        token,
        rol: rol_nombre,
        usuario_id,
        nombre,
        apellido,
    }))
}

async fn recuperar_contrasena(
    State(pool): State<PgPool>,
    Json(request): Json<RecuperarContrasenaRequest>,
) -> Result<Json<RecuperarContrasenaResponse>, StatusCode> {
    // Verificar que el usuario exista
    let row = sqlx::query("SELECT id FROM usuarios WHERE email = $1")
        .bind(&request.email)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            eprintln!("Usuario no encontrado para recuperación de contraseña: {}", e);
            StatusCode::BAD_REQUEST
        })?;

    // Generar token temporal para recuperación (expiración corta, por ejemplo 15 minutos)
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() + 900; // 15 minutos

    let claims = Claims {
        sub: request.email.clone(),
        exp: expiration as usize,
        rol: "recuperacion".to_string(), // Rol temporal
        usuario_id: row.get("id"),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret("tu_clave_secreta_aqui".as_ref()),
    ).map_err(|e| {
        eprintln!("Error al crear token de recuperación: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Simular envío de correo (en consola por ahora)
    println!("Token de recuperación para {}: {}", request.email, token);

    Ok(Json(RecuperarContrasenaResponse {
        mensaje: "Se ha enviado un token de recuperación a tu correo".to_string(),
    }))
}

async fn cambiar_contrasena(
    State(pool): State<PgPool>,
    Json(request): Json<CambiarContrasenaRequest>,
) -> Result<Json<CambiarContrasenaResponse>, StatusCode> {
    // Verificar token
    let token_data = decode::<Claims>(
        &request.token,
        &DecodingKey::from_secret("tu_clave_secreta_aqui".as_ref()),
        &Validation::default(),
    ).map_err(|e| {
        eprintln!("Token inválido o expirado: {}", e);
        StatusCode::UNAUTHORIZED
    })?;

    if token_data.claims.rol != "recuperacion" {
        return Err(StatusCode::UNAUTHORIZED);
    }

    // Encriptar nueva contraseña
    let nueva_contrasena_hash = hash(&request.nueva_contrasena, DEFAULT_COST)
        .map_err(|e| {
            eprintln!("Error al encriptar contraseña: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Actualizar contraseña en la base de datos
    sqlx::query("UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2")
        .bind(&nueva_contrasena_hash)
        .bind(token_data.claims.usuario_id)
        .execute(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al actualizar contraseña: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    Ok(Json(CambiarContrasenaResponse {
        mensaje: "Contraseña actualizada exitosamente".to_string(),
    }))
}

// GET /perfiles_examenes
async fn get_perfiles_examenes(State(pool): State<PgPool>) -> Result<Json<Vec<PerfilExamen>>, StatusCode> {
    let rows = sqlx::query("SELECT id, nombre FROM perfiles_examenes")
        .fetch_all(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al obtener perfiles de exámenes: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let perfiles: Vec<PerfilExamen> = rows
        .into_iter()
        .map(|row| PerfilExamen {
            id: row.get("id"),
            nombre: row.get("nombre"),
        })
        .collect();

    Ok(Json(perfiles))
}

// GET /examenes
async fn get_examenes(State(pool): State<PgPool>) -> Result<Json<Vec<ExamenConPerfil>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT e.id, e.nombre, e.descripcion, e.referencia_resultado, p.nombre AS perfil_nombre FROM examenes e JOIN perfiles_examenes p ON e.perfil_id = p.id"
    )
        .fetch_all(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al obtener exámenes: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let examenes: Vec<ExamenConPerfil> = rows
        .into_iter()
        .map(|row| ExamenConPerfil {
            id: row.get("id"),
            nombre: row.get("nombre"),
            descripcion: row.get("descripcion"),
            referencia_resultado: row.get("referencia_resultado"),
            perfil_nombre: row.get("perfil_nombre"),
        })
        .collect();

    Ok(Json(examenes))
}


// GET /examenes_por_perfil/{perfil_id}
async fn get_examenes_por_perfil(
    Path(perfil_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<Examen>>, StatusCode> {
    let rows = sqlx::query("SELECT id, nombre, descripcion, referencia_resultado, perfil_id FROM examenes WHERE perfil_id = $1")
        .bind(perfil_id)
        .fetch_all(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al obtener exámenes por perfil: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let examenes: Vec<Examen> = rows
        .into_iter()
        .map(|row| Examen {
            id: row.get("id"),
            nombre: row.get("nombre"),
            descripcion: row.get("descripcion"),
            referencia_resultado: row.get("referencia_resultado"),
            perfil_id: row.get("perfil_id"),
        })
        .collect();

    Ok(Json(examenes))
}

// GET /examenes_por_diagnostico/{diagnostico_id}
async fn get_examenes_por_diagnostico(
    Path(diagnostico_id): Path<i32>,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<ExamenDiagnosticoConDetalles>>, StatusCode> {
    let rows = sqlx::query(
        "SELECT ede.id, ede.expediente_diagnostico_id, ede.examen_id, e.nombre AS examen_nombre, e.descripcion AS examen_descripcion, e.referencia_resultado AS examen_referencia, ede.resultado FROM expedientes_diagnosticos_examenes ede JOIN examenes e ON ede.examen_id = e.id WHERE ede.expediente_diagnostico_id = $1"
    )
        .bind(diagnostico_id)
        .fetch_all(&pool)
        .await
        .map_err(|e| {
            eprintln!("Error al obtener exámenes por diagnóstico: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let examenes: Vec<ExamenDiagnosticoConDetalles> = rows
        .into_iter()
        .map(|row| ExamenDiagnosticoConDetalles {
            id: row.get("id"),
            expediente_diagnostico_id: row.get("expediente_diagnostico_id"),
            examen_id: row.get("examen_id"),
            examen_nombre: row.get("examen_nombre"),
            examen_descripcion: row.get("examen_descripcion"),
            examen_referencia: row.get("examen_referencia"),
            resultado: row.get("resultado"),
        })
        .collect();

    Ok(Json(examenes))
}

// POST /examenes_por_diagnostico/{diagnostico_id}
async fn add_examenes_a_diagnostico(
    Path(diagnostico_id): Path<i32>,
    State(pool): State<PgPool>,
    Json(examenes_data): Json<Vec<NuevoExamenDiagnostico>>,
) -> Result<Json<Vec<ExamenDiagnostico>>, StatusCode> {
    let mut resultados = Vec::new();

    for examen_data in examenes_data {
        let result = sqlx::query(
            "INSERT INTO expedientes_diagnosticos_examenes (expediente_diagnostico_id, examen_id, resultado) VALUES ($1, $2, $3) RETURNING id"
        )
            .bind(diagnostico_id)
            .bind(examen_data.examen_id)
            .bind(examen_data.resultado.clone())
            .fetch_one(&pool)
            .await
            .map_err(|e| {
                eprintln!("Error al agregar examen a diagnóstico: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        resultados.push(ExamenDiagnostico {
            id: result.get("id"),
            expediente_diagnostico_id: diagnostico_id,
            examen_id: examen_data.examen_id,
            resultado: examen_data.resultado,
        });
    }

    Ok(Json(resultados))
}



// --- FIN DE FUNCIONES ---


/*fn generar_hash_temporal() {
    let password = "contraseña123";
    let hashed = hash(password, DEFAULT_COST).unwrap();
    println!("Hash para '{}': {}", password, hashed);
}*/


#[tokio::main]
async fn main() {

    //generar_hash_temporal();
    dotenv::dotenv().ok();

    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL debe estar configurado");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("No se pudo conectar a la base de datos");

let app = Router::new()
    .route("/login", post(login))
    .route("/recuperar-contrasena", post(recuperar_contrasena))
    .route("/cambiar-contrasena", post(cambiar_contrasena)) 
    .route("/pacientes", get(get_pacientes).post(create_paciente))
    .route("/pacientes/:id", get(get_paciente_by_id).put(update_paciente).delete(delete_paciente))
    // rutas para expedientes
    .route("/expedientes/:paciente_id", get(get_expediente_by_paciente))
    .route("/expedientes/:paciente_id/diagnosticos", get(get_diagnosticos_by_expediente).post(create_diagnostico))
    // rutas para usuarios
    .route("/usuarios", get(get_usuarios).post(create_usuario))
    // rutas para horarios
    .route("/horarios", get(get_horarios).post(create_horario))
    .route("/horarios/{id}", get(get_horario_by_id).put(update_horario).delete(delete_horario))
    // rutas para citas
    .route("/citas", get(get_citas).post(create_cita))
    .route("/citas/{id}", get(get_cita_by_id).put(update_cita).delete(delete_cita))
    // rutas para exámenes
    .route("/perfiles_examenes", get(get_perfiles_examenes))
    .route("/examenes", get(get_examenes))
    .route("/examenes_por_perfil/{perfil_id}", get(get_examenes_por_perfil))
   
    .route("/examenes_por_diagnostico/{diagnostico_id}", get(get_examenes_por_diagnostico).post(add_examenes_a_diagnostico))
    .layer(
        CorsLayer::new()
            .allow_origin("http://localhost:5173".parse::<axum::http::HeaderValue>().unwrap())
            .allow_methods([axum::http::Method::GET, axum::http::Method::POST, axum::http::Method::PUT, axum::http::Method::DELETE])
            .allow_headers([axum::http::header::CONTENT_TYPE]),
    )
    .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();

    println!("Servidor corriendo en http://0.0.0.0:3000");

    axum::serve(listener, app).await.unwrap();
}